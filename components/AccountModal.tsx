import { ref, getStorage, uploadBytes } from "./firebase.js";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const isWeb = typeof window !== "undefined";

function AccountModal() {
	const serverDomain = process.env.NEXT_PUBLIC_SERVERDOMAIN;
	const [username, setUsername] = useState("");
	const [id, setId] = useState<any>(null);
	const [email, setEmail] = useState("email")

	const [imgLink, setImgLink] = useState(
		"https://firebasestorage.googleapis.com/v0/b/accounts-8a8bf.appspot.com/o/pfp%2Ftwitter-default-pfp.jpeg?alt=media"
	);
	const inputFile: any = useRef(null);

	const clickEvent =
		isWeb &&
		new MouseEvent("click", {
			view: window,
			bubbles: true,
			cancelable: false,
		});
	const storage = getStorage();

	useEffect(() => {
		setUsername(`${localStorage.getItem("username")}`);
		setId(`${localStorage.getItem("id")}`);
		setImgLink(
			`${
				!localStorage.getItem("pfp") ||
				localStorage.getItem("pfp") === "null"
					? "https://firebasestorage.googleapis.com/v0/b/accounts-8a8bf.appspot.com/o/pfp%2Ftwitter-default-pfp.jpeg?alt=media"
					: localStorage.getItem("pfp")
			}`
		);
		setEmail(`${localStorage.getItem("email")}`)
	}, []);

	function chooseImg() {
		try {
			inputFile.current && inputFile.current.dispatchEvent(clickEvent);
		} catch (error) {
			console.error(error);
		}
	}
	function changeImg(e: any) {
		let tempImg = e.target.files[0];

		//make url friendly
		const friendlyUrlName = e.target.files[0].name
			.replace(/[^.,a-zA-Z]/g, "")
			.toLowerCase();

		localStorage.setItem(
			"pfp",
			`https://firebasestorage.googleapis.com/v0/b/accounts-8a8bf.appspot.com/o/pfp%2F${friendlyUrlName}?alt=media`
		);
		setImgLink(
			`https://firebasestorage.googleapis.com/v0/b/accounts-8a8bf.appspot.com/o/pfp%2F${friendlyUrlName}?alt=media`
		);

		const spaceRef = ref(storage, `pfp/${tempImg && friendlyUrlName}`);
		uploadBytes(spaceRef, tempImg).then(async (snapshot) => {
			submit(e);
		});
	}
	function submit(e: any) {
		e.preventDefault();
		(async function () {
			const Rpfp = { imgLink };
			const Rusername = { username };

			const arr = [Rusername, Rpfp];
			const response = await fetch(`${serverDomain}users/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(arr),
			});
			window.location.reload();
			console.log(response);
		})();
	}

	function change(e: any) {
		setUsername(e.target.value);
		localStorage.setItem("username", e.target.value);
	}

	function signOut() {
		localStorage.clear();
	}

	return (
		<>
			<form onSubmit={(e) => submit(e)}>
				<label htmlFor="username">Change username</label>
				<input
					value={username}
					onChange={(e) => change(e)}
					type="text"
					id="username"
				/>

				<h2 className="emailBig">{email}</h2>
				{/* source image */}
				{imgLink && (
					<Image
						src={
							imgLink ||
							"https://firebasestorage.googleapis.com/v0/b/accounts-8a8bf.appspot.com/o/pfp%2Ftwitter-default-pfp.jpeg?alt=media"
						}
						onClick={() => chooseImg()}
						id="choosePfp"
						className="choosePfp"
						alt="Choose image"
						width={200}
						height={200}
					/>
				)}

				{/* invisible input */}
				<input
					className="no"
					accept="image/png, image/jpg, image/jpeg"
					ref={inputFile}
					type="file"
					onChange={(e) => changeImg(e)}
				/>
				<br />

				<button className="floatRight smallButton">save</button>

				<button onClick={signOut} className="red floatLeft">
					sign out
				</button>
			</form>
		</>
	);
}

export default AccountModal;

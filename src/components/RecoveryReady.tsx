"use client";

import { useEffect } from "react";

export function RecoveryReady() {
	useEffect(() => {
		window.dispatchEvent(new Event("rename:ready"));
	}, []);
	return null;
}

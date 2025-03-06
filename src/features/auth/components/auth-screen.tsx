"use client";

import { useState } from "react";
import { SingInFlow } from "../types";
import SignInCard from "./sign-in-card";
import SignUpCard from "./sign-up-card";

function AuthScreen() {
  const [state, setState] = useState<SingInFlow>("signIn");
  return (
    <div className="h-full flex items-center justify-center bg-customBg">
      <div className="md:h-auto md:w-[420px]">
        {state === "signIn" ? (
          <SignInCard setState={setState} />
        ) : (
          <SignUpCard setState={setState} />
        )}
      </div>
    </div>
  );
}

export default AuthScreen;

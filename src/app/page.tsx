import {
  Show,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <h1>Home page</h1>

      <Show when="signed-out">
        <SignUpButton mode="modal">
          Sign Up
        </SignUpButton>
      </Show>

      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
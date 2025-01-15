import { type FC } from "hono/jsx";
import { Layout } from "../layouts/default.tsx";
import { GoogleIcon } from "../../vendor/feathericon/google.tsx";
import { FacebookIcon } from "../../vendor/feathericon/facebook.tsx";
import { GitHubIcon } from "../../vendor/feathericon/github.tsx";

type Props = {
  showSignUpForm?: boolean;
};

export const Login: FC<Props> = ({ showSignUpForm = false }) => {
  return (
    <Layout title="Login or Sign up">
      <div class="container">
        <div class="form-container sign-in">
          <h1 class="title">Login or Sign up</h1>
          <span>with thirdparty accounts</span>

          <div class="social-icons">
            <a href="./google" class="icon"><GoogleIcon /></a>
            <a href="./facebook" class="icon"><FacebookIcon /></a>
            <a href="./github" class="icon"><GitHubIcon /></a>
          </div>
        </div>

        <hr class="line-vertical" />

        <div class="toggle-container">
          <div class="toggle">
            { showSignUpForm ? (
              <div class="toggle-panel">
                <h2>Sign up with password</h2>

                <form>
                  <input type="text" placeholder="Name" />
                  <input type="email" placeholder="Email" />
                  <input type="password" class="last" placeholder="Password" />
                  <button class="button execute">Sign Up</button>
                </form>

                <hr class="line-horizontal" />

                <div class="email-options">
                  <p>Already have an account?</p>
                  <a href="./login" class="button switch">Sign In</a>
                </div>
              </div>
            ) : (
              <div class="toggle-panel">
                <h2>Login with password</h2>

                <form>
                  <input type="email" placeholder="Email" />
                  <input type="password" class="last" placeholder="Password" />
                  <button class="button execute">Sign In</button>
                </form>

                <hr class="line-horizontal" />

                <div class="email-options">
                  <p class="switch-button-annotation">Don't have an account yet?</p>
                  <a href="./login?signup=true" class="button switch">Sign up</a>

                  <a href="#" class="forget-password">Or forget Your Password?</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

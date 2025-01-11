import { type FC } from "hono/jsx";
import { Layout } from "../layouts/default.tsx";
import { GoogleIcon } from "../../vendor/feathericon/google.tsx";
import { FacebookIcon } from "../../vendor/feathericon/facebook.tsx";
import { GitHubIcon } from "../../vendor/feathericon/github.tsx";

export const Login: FC = () => {
  return (
    <Layout title="Login or Sign up">
      <div class="container" id="container">
        <div class="form-container sign-in">
          <h1 class="title">Login or Sign up</h1>
          <span>with thirdparty accounts</span>

          <div class="social-icons">
            <a href="./login/google" class="icon"><GoogleIcon /></a>
            <a href="./login/facebook" class="icon"><FacebookIcon /></a>
            <a href="./login/github" class="icon"><GitHubIcon /></a>
          </div>
        </div>

        <hr class="line-vertical" />

        <div class="toggle-container">
          <div class="toggle">
            <div class="toggle-panel toggle-left">
              <span>or use your email for registration</span>

              <form>
                <input type="text" placeholder="Name" />
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <button>Sign Up</button>
              </form>
            </div>
            <div class="toggle-panel toggle-right">
              <span>or use your email password</span>

              <form>
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <button>Sign In</button>
              </form>

              <hr class="line-horizontal" />

              <div class="email-options">
                <a href="#" class="forget-password">Forget Your Password?</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script src="script.js"></script>
    </Layout>
  );
};

import { css } from "hono/css";

export const styles = css`
  :-hono-global {
    @import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Montserrat", sans-serif;
    }

    body {
      background-color: #c9d6ff;
      background: linear-gradient(to-right, #e2e2e2, #c9d6ff);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      height: 100vh;
    }

    .line-horizontal {
      border: none;
      border-top: 1px solid #aaa;

      width: 95%;

      margin-top: 2rem;
      margin-bottom: 2rem;
    }

    .line-vertical {
      border: none;
      border-left: 1px solid #aaa;

      width: 1px;
      height: 80%;

      margin-left: 2rem;
      margin-right: 2rem;
    }

    .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fff;
      border-radius: 30px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      width: 768px;
      max-width: 100%;
      min-height: 480px;
    }

    .container span {
      font-size: 12px;
    }

    .forget-password {
      color: #333;
      font-size: 13px;
      text-decoration: underline;
    }

    .forget-password:hover {
      color: rgb(40, 93, 252);
    }

    .container button{
      background-color: orangered;
      color:#fff;
      font-size: 12px;
      padding: 10px 45px;
      border: 1px solid transparent ;
      border-radius: 8px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-top: 10px;
      cursor: pointer ;
      box-shadow: 0 0 10px rgba(34,31,31,0.3);
      transition: 0.5s ease;
    }

    .container button:hover, .icon:hover {
      background-color: orangered;
      transform: scale(1.1);
    }

    .form-container {
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 0  40px;
      height: 100%;
    }

    .container input{
      background-color: #eee;
      border: none;
      display: flex;
      margin-top: 0.75em;
      margin-bottom: 0.75em;
      padding: 10px 15px;
      font-size: 13px;
      border-radius: 8px;
      width: 100%;
      outline: none;
    }

    .form-container{
      top: 0;
      height: 100%;
      transition: all 0.6s ease-in-out;
    }

    .sign-in{
      left: 0;
      width: 50%;
      z-index: 2;
    }

    .container.active .sign-in{
      transform: translateX(100%);
    }

    .sign-up{
      left: 0;
      width: 50%;
      opacity: 0;
      z-index: 1;
    }

    .container.active .sign-up{
      transform: translateX(100%);
      opacity: 1;
      z-index: 5;
      animation: move 0.6s;
    }

    @keyframes move{
      0%, 49.99% {
        opacity: 0;
        z-index: 1;
      }
      50%, 100% {
        opacity: 1;
        z-index: 5;
      }
    }

    .title {
      margin-bottom: 0.2em;
    }

    .social-icons{
      margin: 20px 0;
    }

    .social-icons a{
      border: 1px solid #ccc;
      border-radius: 20%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      margin: 0 3px;
      width: 40px;
      height: 40px;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(218,59,59,0.3);
      transition: 0.3s ease;
    }

    .toggle-container{
      width: 50%;
      height: 100%;
      transition: all 0.6s ease-in-out;
      border-radius: 150px 0 0 100px;
    }

    .container.active .toggle-container{
      transform: translateX(-100%);
      border-radius: 0 150px 100px 0;
    }

    .toggle{
      height: 100%;
      width: 200%;
      transform: translateX(0);
      transition: all 0.6s ease-in-out;
    }

    .container.active .toggle{
      transform: translateX(50%);
    }

    .toggle-panel{
      color: #fff;
      width: 50%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 0 30px;
      text-align: center;
      transform: translateX(0);
      transition: all 0.6s ease-in-out;
    }

    .toggle-left{
      transform: translateX(-200%);
    }

    .container.active .toggle-left{
      transform: translateX(0);
    }

    .toggle-right{
      transform: translateX(0);
    }

    .container.active .toggle-right{
      transform: translateX(200%);
    }

    .toggle p{
      color: #fff;
    }

    input.last {
      margin-bottom: 1.5em;
    }

    .email-options {
      display: flex;
      flex-direction: column;
      gap: 0.75em;
      align-items: center;
    }
  }
`;

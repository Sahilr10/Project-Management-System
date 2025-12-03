import Mailgen from "mailgen";


const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome! We're excited to have you on board.",
            action: {
                instructions: "To get started, please verify your email address by clicking the button below:",
                button: {
                    color: "#22BC66",
                    text: "Verify Your Email",
                    link: verificationUrl
                },
            },
            outro: "If you did not create an account, no further action is required."
        },
    };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "You have requested to reset your password.",
            action: {
                instructions: "Click the button below to reset your password:",
                button: {
                    color: "#FF5733",
                    text: "Reset Your Password",
                    link: passwordResetUrl
                },
            },
            outro: "If you did not request a password reset, please ignore this email."
        },
    };
};

export {emailVerificationMailgenContent, forgotPasswordMailgenContent};
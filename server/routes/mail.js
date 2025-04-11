const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "college9652@gmail.com",
    pass: "zidmjidvtjgvzghf",
  },
});
const therapistmail = async (request,randomPassword) => {
const mailOptions = {
  from: "college9652@gmail.com",
  to: request.email,
  subject: "Therapist Account Approved",
  html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h1 style="font-size: 32px; color: #4CAF50;">🎉 Congratulations! 🎉 ${request.name}</h1>
        <p style="font-size: 22px; font-weight: bold; color: #333;">
          Your Therapist account has been approved!
        </p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="font-size: 20px; font-weight: bold; color: #000;">Login Details:</p>
          <p style="font-size: 18px;"><strong>Email:</strong> ${request.email}</p>
          <p style="font-size: 18px;"><strong>Password:</strong> ${randomPassword}</p>
        </div>
        <p style="font-size: 18px; color: #666; margin-top: 20px;">
          Please change your password after logging in for security purposes.
        </p>
      </div>
    `,
};
await transporter.sendMail(mailOptions);
console.log("Email sent successfully");
return ({ message: "Therapist approved and email sent!" });

}
const childmail = async (request, uuid) => {
  const mailOptions = {
    from: "college9652@gmail.com",
    to: request.email,
    subject: "Child Account Approved",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
  <h1 style="font-size: 32px; color: #4CAF50;">🎉 Welcome Aboard, ${request.name}! 🎉</h1>
  <p style="font-size: 22px; font-weight: bold; color: #333;">
    Your Student Account has been successfully created!
  </p>
  <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 20px;">
    <p style="font-size: 20px; font-weight: bold; color: #000;">Your Unique Student ID:</p>
    <p style="font-size: 18px; color: #333;"><strong>${uuid}</strong></p>
  </div>
  <p style="font-size: 18px; color: #666; margin-top: 20px;">
    Please keep this ID safe as it will be required for accessing learning resources and tracking your progress.
  </p>
</div>
    `,
  };
  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully");
  return { message: "child approved and email sent!" };
};

module.exports = {therapistmail,childmail}



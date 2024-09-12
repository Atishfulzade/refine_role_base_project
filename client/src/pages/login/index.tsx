import { AuthPage } from "@refinedev/antd";
import { useNavigation, useNotification,useGo } from "@refinedev/core"; // Import useNavigation and useNotification
import { authProvider } from "../../authProvider";


export const Login = () => {
  const { push } = useNavigation(); // Destructure push method for navigation
  const { open } = useNotification(); // Destructure open method for notifications


  const go = useGo();

  return (
    <AuthPage
      type="login"
      formProps={{
        onFinish: async (values) => {
          try {
           await authProvider.login(values);
            
            // Show success toast notification
            open?.({
              type: "success",
              message: "Login Successful",
              description: "Welcome back!",
            });
            console.log("directing to dashboard");

            // Redirect the user after successful login
            push("/dashboard");
            
          //   go({
          //     to: "/dashboard",
          //     type: "replace", // This replaces the current entry, avoiding adding a new one in history
          // });
            console.log("directed to dashboard");
             // Ensure leading "/" in path
          } catch (error) {
            console.error("Login failed:", error);

            // Show error toast notification
            open?.({
              type: "error",
              message: "Login Failed",
              description: "Please check your credentials and try again.",
            });
          }
        },
      }}
    />
  );
};

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const LoginCallback = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    const handleLoginCallback = async () => {
      // Get authorization code from URL query parameters
      const code = router.query.code as string;
      if (!code) {
        setError("No authorization code provided.");
        setLoading(false);
        return;
      }

      try {
        // Call the Django backend to exchange the code for access and refresh tokens
        const response = await fetch(`http://127.0.0.1:8000/accounts/42/login/callback/?code=${code}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
          // You may want to handle tokens in cookies
          router.push("/dashboard");
        } else {
          setError(data.error || "Failed to log in.");
        }
      } catch (err) {
        setError("An error occurred while processing the login.");
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady && router.query.code) {
      handleLoginCallback();
    }
  }, [router.isReady, router.query.code]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return loading ? <div>Loading...</div> : null;
};

export default LoginCallback;

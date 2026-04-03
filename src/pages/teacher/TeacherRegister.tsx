import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Register from "../Register";

export default function TeacherRegister() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type");

  useEffect(() => {
    if (type !== "teacher") {
      setSearchParams({ type: "teacher" }, { replace: true });
    }
  }, [type, setSearchParams]);

  return <Register />;
}

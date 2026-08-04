import LoanApplicationForm from "@/components/LoanApplicationForm";
import { useNavigate } from "react-router-dom";

const Apply = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return <LoanApplicationForm variant="page" onClose={handleClose} />;
};

export default Apply;

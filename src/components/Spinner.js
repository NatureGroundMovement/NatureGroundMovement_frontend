// components/Spinner.jsx
import { ClipLoader } from "react-spinners";
import "../css/Spinner.css";
import useWindowWidth from "./useWindowWidth";

const Spinner = ({ size: propSize  }) => {
  const width = useWindowWidth();
  const isMobile = width < 768;

  const computedSize = propSize || (isMobile ? 40 : 60);

  return (
    <div className="spinner">
        <ClipLoader color="#4A86E8" size={computedSize}  speedMultiplier={0.8} />
    </div>
  )
}

export default Spinner;

import { Fade } from "@mui/material";
import { useState, useEffect } from "react";

const MyToast: any = (props: any) => {
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setFade(false); // Set fade to false after 3 seconds
    }, 3000);

    return () => clearTimeout(fadeOutTimer); // Clear the timer when component unmounts or when fade changes
  }, []);

  return (
    <>
      <Fade in={fade} timeout={1000}>
        <div className="absolute top-0 right-0 m-12 amatic text-3xl ">
          <div
            id="toast-simple"
            className="flex justify-center items-center w-96 p-4 space-x-4 rtl:space-x-reverse text-gray-100 bg-white divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg shadow dark:text-gray-100 dark:divide-gray-700 space-x dark:bg-gray-800"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>

            <div className="ps-4 w-full text-3xl font-semibold">
              {props.title}
            </div>
          </div>
        </div>
      </Fade>
    </>
  );
};

export default MyToast;

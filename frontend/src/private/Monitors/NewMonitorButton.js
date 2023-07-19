import React from "react";

/**
 * props:
 * - onClick
 */
function NewMonitorButton(props) {
  return (
    <button
      id="btnNewMonitor"
      className="btn btn-primary animate-up-2"
      data-bs-toggle="modal"
      data-bs-target="#modalMonitor"
      onClick={props.onClick}
    >
      <svg
        className="icon icon-xs me-2"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
          clipRule="evenodd"
        />
      </svg>
      New Monitor
    </button>
  );
}

export default NewMonitorButton;

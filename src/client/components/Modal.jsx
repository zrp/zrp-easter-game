import { useState } from "react";

export default function Modal({ open, onClose, children, title } = { open: false, title: null }) {
  const closeModal = () => {
    if (onClose) {
      onClose()
    }
  }

  return <div id="modal" className={`absolute w-full h-full top-0 left-0 z-50 ${open ? '' : 'hidden'}`}>
    <div id="modal-overlay" className="fixed z-20 top-0 left-0 bg-black opacity-25 w-full h-full" onClick={() => closeModal()}></div>
    <div id="modal-content" className={'text-white z-20 w-3/4 h-3/4 rounded border border-gray-200 bg-gray-800 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col'}>
      <nav className='w-100 h-10 flex border-b border-gray-50 items-center justify-between'>
        <span className='text-xs ml-4'>{title}</span>
        {onClose ? <button className='w-28 h-full flex text-center border-l border-l-gray-50 ml-auto items-center justify-center hover:bg-red-500 rounded-tr' onClick={e => closeModal()}>
          <div className="w-6 h-6">
            <svg fill='white' viewBox='0 0 512 512' width={24} height={24} className="block">
              <path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z" />
            </svg>
          </div>
        </button>
          : <></>}
      </nav>
      {children}

    </div>
  </div>
}

Modal.defaultProps = { title: "" }

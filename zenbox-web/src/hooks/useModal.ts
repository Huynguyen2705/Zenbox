import { useState } from 'react';

export const useModal = <T = Record<string, unknown>>() => {
  const [modal, setModal] = useState<{ show: boolean; data?: T }>({ show: false, });

  const handleShow = (data?: T) => {
    setModal({ show: true, data });
  };
  const handleHide = () => {
    setModal({ show: false });
  };

  return {
    show: modal?.show,
    handleShow,
    handleHide,
    data: modal?.data,
  };
};

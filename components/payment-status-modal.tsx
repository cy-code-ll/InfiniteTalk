'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function PaymentStatusModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    buttonText: 'Confirm'
  });
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const paysuccess = searchParams.get('paysuccess');
    const payfail = searchParams.get('payfail');
    let content = {
      title: '',
      message: '',
      buttonText: 'Confirm'
    };
    let shouldOpenModal = false;
    let successState: boolean | null = null;

    if (paysuccess === '1') {
      content = {
        title: 'Success',
        message: 'Subscription successful! Welcome aboard.',
        buttonText: 'Confirm'
      };
      shouldOpenModal = true;
      successState = true;
    } else if (payfail === '1') {
      content = {
        title: 'Failed',
        message: 'Subscription failed. Please check your payment details or try again.',
        buttonText: 'Confirm'
      };
      shouldOpenModal = true;
      successState = false;
    }

    if (shouldOpenModal) {
      setModalContent(content);
      setIsSuccess(successState);
      setIsModalOpen(true);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('paysuccess');
      newParams.delete('payfail');
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false }); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname, router]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className="relative z-50 w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-2">
          {modalContent.title}
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {modalContent.message}
          </p>
        </div>
        <div className="mt-5 sm:mt-6">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
            onClick={closeModal}
          >
            {modalContent.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
} 
import { useState, useEffect } from "react";
import Image from "next/image";
import "tailwindcss/tailwind.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";

const ImageGallery = () => {
    const images = [
        "/img/event/Bathroom_1_gqd2qg.webp",
        "/img/event/DELUXE_STUDIO_ROOM_shq8yw.webp",
        "/img/event/Suite_tbbeyh.webp",
        "/img/event/ELITE_FAMILY_ROOM_qfkdwi.webp",
        "/img/event/Option01_View02_01_z2wymh.webp",
        "/img/event/ELITE_KING_ROOM_ontvbi.webp",
        "/img/event/DELUXE_TWIN_tigtf8.webp",
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(3); // start from 4th image

    const openModal = () => {
        setCurrentIndex(3);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 3 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            prev < images.length - 1 ? prev + 1 : prev
        );
    };

    useEffect(() => {
        const handleBodyScroll = () => {
            document.body.style.overflow = isModalOpen ? "hidden" : "auto";
        };

        handleBodyScroll();
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isModalOpen]);

    return (
        <>
            {/* Grid View */}
            <div className="grid grid-cols-3 gap-4">
                {images.slice(0, 3).map((img, index) => (
                    <div
                        key={index}
                        className="relative w-full h-40 rounded overflow-hidden cursor-pointer"
                        onClick={index === 2 ? openModal : undefined}
                    >
                        <Image
                            src={img}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        {index === 2 && (
                            <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center text-white font-semibold text-lg">
                                +{images.length - 3} more
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 -top-10">
                    <div className="bg-white p-4 rounded shadow-lg w-[90%] sm:w-[500px] relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-1 right-1 text-gray-700 font-bold "
                        >
                            <FontAwesomeIcon icon={faXmarkCircle} />
                        </button>

                        <div className="flex justify-between items-center mb-3">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex <= 3}
                                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentIndex >= images.length - 1}
                                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                            >
                                Next →
                            </button>
                        </div>

                        <div className="relative w-full h-64 rounded overflow-hidden">
                            <Image
                                src={images[currentIndex]}
                                alt={`Image ${currentIndex + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageGallery;

import Image from 'next/image';
import companyLogo from "@/images/corporate/Final Coming Soon.png";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";

const comingSoon = () => {

    return (
        <>
            <div className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                <Header />
            </div>
            <div className="flex flex-col items-center p-4">


                <div className="relative w-full h-[700px]">
                    <Image
                        src={companyLogo}
                        alt="Example"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg "
                    />
                </div>

            </div>
            <div>
                <Footer1 />
            </div>
        </>
    );
};

export default comingSoon;

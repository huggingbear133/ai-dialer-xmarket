import Link from "next/link";

const FooterBase = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background justify-center items">
        <div className="mx-auto my-auto">
          {/* Bottom Section */}
          <div className="py-6 border-t justify-center items-center">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground ml-[280px]">
                © {currentYear} <a href="https://dialwise.ai" target="_blank">DialWise.ai</a>. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0 mr-[30px]">
                {/* <Link href="/partners" className="text-sm text-muted-foreground hover:text-primary">
                  Partners
                </Link> */}
                <Link href="https://dialwise.ai/privacy" target="_blank" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
                <Link href="https://dialwise.ai/terms" target="_blank" className="text-sm text-muted-foreground hover:text-primary">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
    </footer>
  );
};

export default FooterBase;

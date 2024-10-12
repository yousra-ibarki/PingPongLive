import Link from "next/link";

export default function CardGrid() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-screen fixed top-0 left-0 h-[100px] bg-gray-100 bg-opacity-50 z-50">
        <nav className="max-w-10xl mx-auto px-4 sm:px-6 laptop:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo or Title */}
            <div className="flex-shrink-0 mr-30">
              <img src="./logoBlack.svg" alt="logo" className="mt-0 p-5" />
            </div>

            {/* Navbar Links */}
            <div className="hidden lg:flex w-full fixed justify-center items-start h-16 mr-10">
              <div className="flex items-center space-x-20 mr-10">
                <Link href="/dashboard">
                  <img src="./Home_logo.svg" alt="Home" />
                </Link>
                <Link href="/About">
                  <img src="./About_logo.svg" alt="About" />
                </Link>
              </div>
            </div>
            {/* Mobile */}
            <div className="flex lg:hidden flex-grow justify-center items-center h-16">
              <div className="flex space-x-10">
                <img src="./Home_logo.svg" alt="Home" className="w-1/2" />
                <img src="./About_logo.svg" alt="About" className="w-1/2" />
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* <div>
      <img src="./logoBlack.svg" alt="logoBlack" className="mt-0 p-5"/>
      </div> */}
      {/* About Us */}
      <div className="absolute top-[250px] flex justify-center w-full">
        <div className="bg-[#D9D9D9] bg-opacity-90 text-black px-[50px] py-4 rounded-lg shadow-lg shadow-[#616161] border border-gray-300">
          <p className="text-2xl font-bold font-custom tracking-wide">
            About Us
          </p>
        </div>
      </div>
{/* 
      <div className="absolute tablet:bottom-[100px] bottom-auto flex justify-center w-full top-[calc(100% + 20px">
          <div className="bg-[#000000] bg-opacity-90 text-[#FFFFFF] px-[50px] py-4 rounded-lg shadow-lg shadow-[#616161] border border-[#000000]">
            <p className="text-2xl font-bold font-custom tracking-wide">
              The Project Builders
            </p>
          </div>
      </div> */}

      <div className="flex flex-col tablet:flex-row z-10 justify-center tablet:mt-0 mt-[400px]">
        {/* First card */}
        <div
          className="w-full sm:w-64 md:w-[220px] laptop:w-64 h-[500px] m-4 bg-black shadow-xl shadow-black rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 opacity-0 fade-in group"
          style={{ animationDelay: "0s" }}
        >
          <img
            className="h-full w-full object-cover hover:blur-sm transition duration-300 group-hover:blur-sm"
            src="image1.jpeg"
            alt="Card 1"
          />
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center">
            {/* Social links */}
            <div className="space-y-6 text-white text-xs">
              {/* GitHub */}
              <a
                href="https://github.com/Scha77en"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_874_546)">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12.0099 0C5.36875 0 0 5.40833 0 12.0992C0 17.4475 3.43994 21.9748 8.21205 23.5771C8.80869 23.6976 9.02724 23.3168 9.02724 22.9965C9.02724 22.716 9.00757 21.7545 9.00757 20.7527C5.6667 21.474 4.97099 19.3104 4.97099 19.3104C4.43409 17.9082 3.63858 17.5478 3.63858 17.5478C2.54511 16.8066 3.71823 16.8066 3.71823 16.8066C4.93117 16.8868 5.56763 18.0486 5.56763 18.0486C6.64118 19.8913 8.37111 19.3707 9.06706 19.0501C9.16638 18.2688 9.48473 17.728 9.82275 17.4276C7.15817 17.1471 4.35469 16.1055 4.35469 11.458C4.35469 10.1359 4.8316 9.05428 5.58729 8.21304C5.46807 7.91263 5.0504 6.67043 5.70677 5.00787C5.70677 5.00787 6.72083 4.6873 9.00732 6.24981C9.98625 5.98497 10.9958 5.85024 12.0099 5.84911C13.024 5.84911 14.0577 5.98948 15.0123 6.24981C17.299 4.6873 18.3131 5.00787 18.3131 5.00787C18.9695 6.67043 18.5515 7.91263 18.4323 8.21304C19.2079 9.05428 19.6652 10.1359 19.6652 11.458C19.6652 16.1055 16.8617 17.1269 14.1772 17.4276C14.6148 17.8081 14.9924 18.5292 14.9924 19.6711C14.9924 21.2936 14.9727 22.5957 14.9727 22.9962C14.9727 23.3168 15.1915 23.6976 15.7879 23.5774C20.56 21.9745 23.9999 17.4475 23.9999 12.0992C24.0196 5.40833 18.6312 0 12.0099 0Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_874_546">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>github.com/Scha77en</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/abdellah-ouhbi/"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.4455 0H1.55039C0.693164 0 0 0.676758 0 1.51348V19.4824C0 20.3191 0.693164 21 1.55039 21H19.4455C20.3027 21 21 20.3191 21 19.4865V1.51348C21 0.676758 20.3027 0 19.4455 0ZM6.23027 17.8951H3.11309V7.8709H6.23027V17.8951ZM4.67168 6.50508C3.6709 6.50508 2.86289 5.69707 2.86289 4.70039C2.86289 3.70371 3.6709 2.8957 4.67168 2.8957C5.66836 2.8957 6.47637 3.70371 6.47637 4.70039C6.47637 5.69297 5.66836 6.50508 4.67168 6.50508ZM17.8951 17.8951H14.782V13.0225C14.782 11.8617 14.7615 10.3646 13.1619 10.3646C11.5418 10.3646 11.2957 11.632 11.2957 12.9404V17.8951H8.18672V7.8709H11.1727V9.24082H11.2137C11.6279 8.45332 12.6451 7.6207 14.1586 7.6207C17.3127 7.6207 17.8951 9.69609 17.8951 12.3949V17.8951V17.8951Z"
                    fill="white"
                  />
                </svg>
                <span>LinkedIn.com/AbdellahOuhbi</span>
              </a>

              {/* Email */}
              <a
                href="mailto:abdououhbi1@gmail.com"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M29 9V23C29 24.1046 28.1046 25 27 25H5C3.89543 25 3 24.1046 3 23V9M29 9C29 7.89543 28.1046 7 27 7H5C3.89543 7 3 7.89543 3 9M29 9L17.1384 17.2119C16.4535 17.686 15.5465 17.686 14.8616 17.2119L3 9"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>abdououhbi1@gmail.com</span>
              </a>
            </div>
            {/* Full Name at the Bottom */}
            <div className="absolute bottom-4 text-white font-serif text-sm">
              Abdellah Ouhbi
            </div>
          </div>
        </div>

        {/* Second card (lowered) */}
        <div
          className="w-full sm:w-64 md:w-[220px] laptop:w-64 h-[500px] m-4 bg-black shadow-xl shadow-black rounded-lg tablet:mt-20 overflow-hidden transform transition-transform duration-300 hover:scale-105 opacity-0 fade-in group"
          style={{ animationDelay: "0.4s" }}
        >
          <img
            className="h-full w-full object-cover hover:blur-sm transition duration-300 group-hover:blur-sm"
            src="image2.jpeg"
            alt="Card 2"
          />
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center">
            {/* Social links */}
            <div className="space-y-6 text-white text-xs">
              {/* GitHub */}
              <a
                href="https://github.com/Scha77en"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_874_546)">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12.0099 0C5.36875 0 0 5.40833 0 12.0992C0 17.4475 3.43994 21.9748 8.21205 23.5771C8.80869 23.6976 9.02724 23.3168 9.02724 22.9965C9.02724 22.716 9.00757 21.7545 9.00757 20.7527C5.6667 21.474 4.97099 19.3104 4.97099 19.3104C4.43409 17.9082 3.63858 17.5478 3.63858 17.5478C2.54511 16.8066 3.71823 16.8066 3.71823 16.8066C4.93117 16.8868 5.56763 18.0486 5.56763 18.0486C6.64118 19.8913 8.37111 19.3707 9.06706 19.0501C9.16638 18.2688 9.48473 17.728 9.82275 17.4276C7.15817 17.1471 4.35469 16.1055 4.35469 11.458C4.35469 10.1359 4.8316 9.05428 5.58729 8.21304C5.46807 7.91263 5.0504 6.67043 5.70677 5.00787C5.70677 5.00787 6.72083 4.6873 9.00732 6.24981C9.98625 5.98497 10.9958 5.85024 12.0099 5.84911C13.024 5.84911 14.0577 5.98948 15.0123 6.24981C17.299 4.6873 18.3131 5.00787 18.3131 5.00787C18.9695 6.67043 18.5515 7.91263 18.4323 8.21304C19.2079 9.05428 19.6652 10.1359 19.6652 11.458C19.6652 16.1055 16.8617 17.1269 14.1772 17.4276C14.6148 17.8081 14.9924 18.5292 14.9924 19.6711C14.9924 21.2936 14.9727 22.5957 14.9727 22.9962C14.9727 23.3168 15.1915 23.6976 15.7879 23.5774C20.56 21.9745 23.9999 17.4475 23.9999 12.0992C24.0196 5.40833 18.6312 0 12.0099 0Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_874_546">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>github.com/abdelfatah</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/abdellah-ouhbi/"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.4455 0H1.55039C0.693164 0 0 0.676758 0 1.51348V19.4824C0 20.3191 0.693164 21 1.55039 21H19.4455C20.3027 21 21 20.3191 21 19.4865V1.51348C21 0.676758 20.3027 0 19.4455 0ZM6.23027 17.8951H3.11309V7.8709H6.23027V17.8951ZM4.67168 6.50508C3.6709 6.50508 2.86289 5.69707 2.86289 4.70039C2.86289 3.70371 3.6709 2.8957 4.67168 2.8957C5.66836 2.8957 6.47637 3.70371 6.47637 4.70039C6.47637 5.69297 5.66836 6.50508 4.67168 6.50508ZM17.8951 17.8951H14.782V13.0225C14.782 11.8617 14.7615 10.3646 13.1619 10.3646C11.5418 10.3646 11.2957 11.632 11.2957 12.9404V17.8951H8.18672V7.8709H11.1727V9.24082H11.2137C11.6279 8.45332 12.6451 7.6207 14.1586 7.6207C17.3127 7.6207 17.8951 9.69609 17.8951 12.3949V17.8951V17.8951Z"
                    fill="white"
                  />
                </svg>
                <span>LinkedIn.com/abdelfatah</span>
              </a>

              {/* Email */}
              <a
                href="mailto:abdououhbi1@gmail.com"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M29 9V23C29 24.1046 28.1046 25 27 25H5C3.89543 25 3 24.1046 3 23V9M29 9C29 7.89543 28.1046 7 27 7H5C3.89543 7 3 7.89543 3 9M29 9L17.1384 17.2119C16.4535 17.686 15.5465 17.686 14.8616 17.2119L3 9"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>abdelfatah1@gmail.com</span>
              </a>
            </div>
            {/* Full Name at the Bottom */}
            <div className="absolute bottom-4 text-white font-serif text-sm">
              Abdelfatah
            </div>
          </div>
        </div>

        {/* Third card */}
        <div
          className="w-full sm:w-64 md:w-[220px] laptop:w-64 h-[500px] m-4 bg-black shadow-xl shadow-black rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 opacity-0 fade-in group"
          style={{ animationDelay: "0.8s" }}
        >
          <img
            className="h-full w-full object-cover hover:blur-sm transition duration-300 group-hover:blur-sm"
            src="image3.jpeg"
            alt="Card 3"
          />
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center">
            {/* Social links */}
            <div className="space-y-6 text-white text-xs">
              {/* GitHub */}
              <a
                href="https://github.com/Scha77en"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_874_546)">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12.0099 0C5.36875 0 0 5.40833 0 12.0992C0 17.4475 3.43994 21.9748 8.21205 23.5771C8.80869 23.6976 9.02724 23.3168 9.02724 22.9965C9.02724 22.716 9.00757 21.7545 9.00757 20.7527C5.6667 21.474 4.97099 19.3104 4.97099 19.3104C4.43409 17.9082 3.63858 17.5478 3.63858 17.5478C2.54511 16.8066 3.71823 16.8066 3.71823 16.8066C4.93117 16.8868 5.56763 18.0486 5.56763 18.0486C6.64118 19.8913 8.37111 19.3707 9.06706 19.0501C9.16638 18.2688 9.48473 17.728 9.82275 17.4276C7.15817 17.1471 4.35469 16.1055 4.35469 11.458C4.35469 10.1359 4.8316 9.05428 5.58729 8.21304C5.46807 7.91263 5.0504 6.67043 5.70677 5.00787C5.70677 5.00787 6.72083 4.6873 9.00732 6.24981C9.98625 5.98497 10.9958 5.85024 12.0099 5.84911C13.024 5.84911 14.0577 5.98948 15.0123 6.24981C17.299 4.6873 18.3131 5.00787 18.3131 5.00787C18.9695 6.67043 18.5515 7.91263 18.4323 8.21304C19.2079 9.05428 19.6652 10.1359 19.6652 11.458C19.6652 16.1055 16.8617 17.1269 14.1772 17.4276C14.6148 17.8081 14.9924 18.5292 14.9924 19.6711C14.9924 21.2936 14.9727 22.5957 14.9727 22.9962C14.9727 23.3168 15.1915 23.6976 15.7879 23.5774C20.56 21.9745 23.9999 17.4475 23.9999 12.0992C24.0196 5.40833 18.6312 0 12.0099 0Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_874_546">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>github.com/ayoub</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/abdellah-ouhbi/"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.4455 0H1.55039C0.693164 0 0 0.676758 0 1.51348V19.4824C0 20.3191 0.693164 21 1.55039 21H19.4455C20.3027 21 21 20.3191 21 19.4865V1.51348C21 0.676758 20.3027 0 19.4455 0ZM6.23027 17.8951H3.11309V7.8709H6.23027V17.8951ZM4.67168 6.50508C3.6709 6.50508 2.86289 5.69707 2.86289 4.70039C2.86289 3.70371 3.6709 2.8957 4.67168 2.8957C5.66836 2.8957 6.47637 3.70371 6.47637 4.70039C6.47637 5.69297 5.66836 6.50508 4.67168 6.50508ZM17.8951 17.8951H14.782V13.0225C14.782 11.8617 14.7615 10.3646 13.1619 10.3646C11.5418 10.3646 11.2957 11.632 11.2957 12.9404V17.8951H8.18672V7.8709H11.1727V9.24082H11.2137C11.6279 8.45332 12.6451 7.6207 14.1586 7.6207C17.3127 7.6207 17.8951 9.69609 17.8951 12.3949V17.8951V17.8951Z"
                    fill="white"
                  />
                </svg>
                <span>LinkedIn.com/ayoub</span>
              </a>

              {/* Email */}
              <a
                href="mailto:abdououhbi1@gmail.com"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M29 9V23C29 24.1046 28.1046 25 27 25H5C3.89543 25 3 24.1046 3 23V9M29 9C29 7.89543 28.1046 7 27 7H5C3.89543 7 3 7.89543 3 9M29 9L17.1384 17.2119C16.4535 17.686 15.5465 17.686 14.8616 17.2119L3 9"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Ayoub1@gmail.com</span>
              </a>
            </div>
            {/* Full Name at the Bottom */}
            <div className="absolute bottom-4 text-white font-serif text-sm">
              Ayoub
            </div>
          </div>
        </div>

        {/* Fourth card (lowered) */}
        <div
          className="w-full sm:w-64 md:w-[220px] laptop:w-64 h-[500px] m-4 bg-black shadow-xl shadow-black rounded-lg overflow-hidden tablet:mt-20 transform transition-transform duration-300 hover:scale-105 opacity-0 fade-in group"
          style={{ animationDelay: "1.2s" }}
        >
          <img
            className="h-full w-full object-cover hover:blur-sm transition duration-300 group-hover:blur-sm"
            src="image4.jpeg"
            alt="Card 4"
          />
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center">
            {/* Social links */}
            <div className="space-y-6 text-white text-xs">
              {/* GitHub */}
              <a
                href="https://github.com/Scha77en"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_874_546)">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12.0099 0C5.36875 0 0 5.40833 0 12.0992C0 17.4475 3.43994 21.9748 8.21205 23.5771C8.80869 23.6976 9.02724 23.3168 9.02724 22.9965C9.02724 22.716 9.00757 21.7545 9.00757 20.7527C5.6667 21.474 4.97099 19.3104 4.97099 19.3104C4.43409 17.9082 3.63858 17.5478 3.63858 17.5478C2.54511 16.8066 3.71823 16.8066 3.71823 16.8066C4.93117 16.8868 5.56763 18.0486 5.56763 18.0486C6.64118 19.8913 8.37111 19.3707 9.06706 19.0501C9.16638 18.2688 9.48473 17.728 9.82275 17.4276C7.15817 17.1471 4.35469 16.1055 4.35469 11.458C4.35469 10.1359 4.8316 9.05428 5.58729 8.21304C5.46807 7.91263 5.0504 6.67043 5.70677 5.00787C5.70677 5.00787 6.72083 4.6873 9.00732 6.24981C9.98625 5.98497 10.9958 5.85024 12.0099 5.84911C13.024 5.84911 14.0577 5.98948 15.0123 6.24981C17.299 4.6873 18.3131 5.00787 18.3131 5.00787C18.9695 6.67043 18.5515 7.91263 18.4323 8.21304C19.2079 9.05428 19.6652 10.1359 19.6652 11.458C19.6652 16.1055 16.8617 17.1269 14.1772 17.4276C14.6148 17.8081 14.9924 18.5292 14.9924 19.6711C14.9924 21.2936 14.9727 22.5957 14.9727 22.9962C14.9727 23.3168 15.1915 23.6976 15.7879 23.5774C20.56 21.9745 23.9999 17.4475 23.9999 12.0992C24.0196 5.40833 18.6312 0 12.0099 0Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_874_546">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>github.com/youssra</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/abdellah-ouhbi/"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.4455 0H1.55039C0.693164 0 0 0.676758 0 1.51348V19.4824C0 20.3191 0.693164 21 1.55039 21H19.4455C20.3027 21 21 20.3191 21 19.4865V1.51348C21 0.676758 20.3027 0 19.4455 0ZM6.23027 17.8951H3.11309V7.8709H6.23027V17.8951ZM4.67168 6.50508C3.6709 6.50508 2.86289 5.69707 2.86289 4.70039C2.86289 3.70371 3.6709 2.8957 4.67168 2.8957C5.66836 2.8957 6.47637 3.70371 6.47637 4.70039C6.47637 5.69297 5.66836 6.50508 4.67168 6.50508ZM17.8951 17.8951H14.782V13.0225C14.782 11.8617 14.7615 10.3646 13.1619 10.3646C11.5418 10.3646 11.2957 11.632 11.2957 12.9404V17.8951H8.18672V7.8709H11.1727V9.24082H11.2137C11.6279 8.45332 12.6451 7.6207 14.1586 7.6207C17.3127 7.6207 17.8951 9.69609 17.8951 12.3949V17.8951V17.8951Z"
                    fill="white"
                  />
                </svg>
                <span>LinkedIn.com/Youssra</span>
              </a>

              {/* Email */}
              <a
                href="mailto:abdououhbi1@gmail.com"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M29 9V23C29 24.1046 28.1046 25 27 25H5C3.89543 25 3 24.1046 3 23V9M29 9C29 7.89543 28.1046 7 27 7H5C3.89543 7 3 7.89543 3 9M29 9L17.1384 17.2119C16.4535 17.686 15.5465 17.686 14.8616 17.2119L3 9"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>youssra1@gmail.com</span>
              </a>
            </div>
            {/* Full Name at the Bottom */}
            <div className="absolute bottom-4 text-white font-serif text-sm">
              Youssra
            </div>
          </div>
        </div>

        {/* Fifth card */}
        <div
          className="w-full sm:w-64 md:w-[220px] laptop:w-64 h-[500px] m-4 bg-black shadow-xl shadow-black rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 opacity-0 fade-in group"
          style={{ animationDelay: "1.6s" }}
        >
          <img
            className="h-full w-full object-cover hover:blur-sm transition duration-300 group-hover:blur-sm"
            src="image5.jpeg"
            alt="Card 5"
          />
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center">
            {/* Social links */}
            <div className="space-y-6 text-white text-xs">
              {/* GitHub */}
              <a
                href="https://github.com/Scha77en"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_874_546)">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12.0099 0C5.36875 0 0 5.40833 0 12.0992C0 17.4475 3.43994 21.9748 8.21205 23.5771C8.80869 23.6976 9.02724 23.3168 9.02724 22.9965C9.02724 22.716 9.00757 21.7545 9.00757 20.7527C5.6667 21.474 4.97099 19.3104 4.97099 19.3104C4.43409 17.9082 3.63858 17.5478 3.63858 17.5478C2.54511 16.8066 3.71823 16.8066 3.71823 16.8066C4.93117 16.8868 5.56763 18.0486 5.56763 18.0486C6.64118 19.8913 8.37111 19.3707 9.06706 19.0501C9.16638 18.2688 9.48473 17.728 9.82275 17.4276C7.15817 17.1471 4.35469 16.1055 4.35469 11.458C4.35469 10.1359 4.8316 9.05428 5.58729 8.21304C5.46807 7.91263 5.0504 6.67043 5.70677 5.00787C5.70677 5.00787 6.72083 4.6873 9.00732 6.24981C9.98625 5.98497 10.9958 5.85024 12.0099 5.84911C13.024 5.84911 14.0577 5.98948 15.0123 6.24981C17.299 4.6873 18.3131 5.00787 18.3131 5.00787C18.9695 6.67043 18.5515 7.91263 18.4323 8.21304C19.2079 9.05428 19.6652 10.1359 19.6652 11.458C19.6652 16.1055 16.8617 17.1269 14.1772 17.4276C14.6148 17.8081 14.9924 18.5292 14.9924 19.6711C14.9924 21.2936 14.9727 22.5957 14.9727 22.9962C14.9727 23.3168 15.1915 23.6976 15.7879 23.5774C20.56 21.9745 23.9999 17.4475 23.9999 12.0992C24.0196 5.40833 18.6312 0 12.0099 0Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_874_546">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>github.com/Ahmed</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/abdellah-ouhbi/"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.4455 0H1.55039C0.693164 0 0 0.676758 0 1.51348V19.4824C0 20.3191 0.693164 21 1.55039 21H19.4455C20.3027 21 21 20.3191 21 19.4865V1.51348C21 0.676758 20.3027 0 19.4455 0ZM6.23027 17.8951H3.11309V7.8709H6.23027V17.8951ZM4.67168 6.50508C3.6709 6.50508 2.86289 5.69707 2.86289 4.70039C2.86289 3.70371 3.6709 2.8957 4.67168 2.8957C5.66836 2.8957 6.47637 3.70371 6.47637 4.70039C6.47637 5.69297 5.66836 6.50508 4.67168 6.50508ZM17.8951 17.8951H14.782V13.0225C14.782 11.8617 14.7615 10.3646 13.1619 10.3646C11.5418 10.3646 11.2957 11.632 11.2957 12.9404V17.8951H8.18672V7.8709H11.1727V9.24082H11.2137C11.6279 8.45332 12.6451 7.6207 14.1586 7.6207C17.3127 7.6207 17.8951 9.69609 17.8951 12.3949V17.8951V17.8951Z"
                    fill="white"
                  />
                </svg>
                <span>LinkedIn.com/Ahmed</span>
              </a>

              {/* Email */}
              <a
                href="mailto:abdououhbi1@gmail.com"
                target="_blank"
                className="flex items-center space-x-2"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M29 9V23C29 24.1046 28.1046 25 27 25H5C3.89543 25 3 24.1046 3 23V9M29 9C29 7.89543 28.1046 7 27 7H5C3.89543 7 3 7.89543 3 9M29 9L17.1384 17.2119C16.4535 17.686 15.5465 17.686 14.8616 17.2119L3 9"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>ahmed1@gmail.com</span>
              </a>
            </div>
            {/* Full Name at the Bottom */}
            <div className="absolute bottom-4 text-white font-serif text-sm">
              Ahmed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import Image from 'next/image';

// export default function Home() {
//   const images = [
//     '/image1.jpeg',
//     '/image2.jpeg',
//     '/image3.jpeg',
//     '/image4.jpeg',
//     '/image5.jpeg',
//   ];

//   return (
//     //     // <div className="min-h-screen bg-[#95b5e6] ">
//     //     //   <img src="./logoBlack.svg" alt="logoBlack" className="m-10 mt-0 p-5"/>
//     //     // </div>
//     <div className="flex justify-center mt-10">
//       <img src="./logoBlack.svg" alt="logoBlack" className="m-10 mt-0 p-5"/>
//       <div className="grid grid-cols-5 gap-4">
//         {images.map((img, index) => (
//           <div
//             key={index}
//             className="relative w-60 h-[400px] overflow-hidden rounded-laptop shadow-laptop transition-transform transform hover:scale-105"
//           >
//             <Image
//               src={img}
//               alt={`Image ${index + 1}`}
//               layout="fill"
//               objectFit="cover"
//               className="transition-all duration-300 ease-in-out hover:blur-sm"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function About() {

//   return (

//   );
// }

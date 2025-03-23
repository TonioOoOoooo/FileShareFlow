import AuthButton from "./AuthButton";

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <i className="ri-file-upload-line text-blue-600 text-2xl mr-2"></i>
            <h1 className="text-xl font-semibold text-gray-700">OneDrive Upload & Markdown Processor</h1>
          </div>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

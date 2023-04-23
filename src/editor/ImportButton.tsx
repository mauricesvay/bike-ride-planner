import { Button, VisuallyHidden } from "@chakra-ui/react";
import { useRef } from "react";

export function ImportButton({
  onFileSelected,
}: {
  onFileSelected: (files: FileList) => void;
}) {
  const inputFile = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length) {
      onFileSelected(files);
      if (inputFile.current) {
        inputFile.current.value = "";
      }
    }
  };
  const handleButtonClick = () => inputFile?.current?.click();
  return (
    <>
      <VisuallyHidden>
        <input
          accept=".gpx"
          ref={inputFile}
          onChange={handleFileUpload}
          type="file"
        />
      </VisuallyHidden>
      <Button onClick={handleButtonClick}>Import GPX</Button>
    </>
  );
}

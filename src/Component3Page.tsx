import ToeflApp from "./components/toefl/ToeflApp";

interface Component3PageProps {
  onClose: () => void;
}

export default function Component3Page({ onClose }: Component3PageProps) {
  return <ToeflApp onClose={onClose} />;
}

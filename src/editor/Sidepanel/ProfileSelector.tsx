import { Select } from "@chakra-ui/react";
import { BrouterProfile, isBrouterProfile } from "../../modules/router/use-brouter-route";

const availableProfiles = {
  safety: "Itinéraire sécurisé",
  trekking: "Balade à vélo",
  fastbike: "Vélo route",
  shortest: "Itinéraire le plus court",
};

export function ProfileSelector({
  profile,
  onProfileChange,
}: {
  profile: BrouterProfile;
  onProfileChange: (profile: BrouterProfile) => void;
}) {
  return (
    <Select
      placeholder="Type d'itinéraire:"
      onChange={(e) => {
        const value = e.target.value;
        if (isBrouterProfile(value)) {
          onProfileChange(value);
        }
      }}
      value={profile}
    >
      {Object.entries(availableProfiles).map(([value, label]) => (
        <option value={value} key={value}>
          {label}
        </option>
      ))}
    </Select>
  );
}

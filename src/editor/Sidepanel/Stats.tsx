import { Stack, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import numeral from "numeral";
import { useTranslation } from "react-i18next";

export function Stats({
  distance,
  duration,
  ascend,
}: {
  distance?: number;
  duration?: number;
  ascend?: number;
}) {
  const { t } = useTranslation();
  const formattedDistance = distance
    ? numeral(distance / 1000).format("0.00")
    : "-";
  const formattedTime = duration ? numeral(duration).format("00:00:00") : "-";
  const formattedAscend = ascend ? numeral(ascend).format("0") : "-";
  return (
    <Stack
      direction={"row"}
      p="4"
      spacing={8}
      borderWidth="1px"
      borderRadius="md"
    >
      <Stat size="sm">
        <StatLabel>{t("editor.stats.distance")}</StatLabel>
        <StatNumber>{formattedDistance}km</StatNumber>
      </Stat>
      <Stat size="sm">
        <StatLabel>{t("editor.stats.duration")}</StatLabel>
        <StatNumber>{formattedTime}</StatNumber>
      </Stat>
      <Stat size="sm">
        <StatLabel>{t("editor.stats.ascend")}</StatLabel>
        <StatNumber>{formattedAscend}m</StatNumber>
      </Stat>
    </Stack>
  );
}

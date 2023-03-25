import { DeleteIcon, DragHandleIcon } from "@chakra-ui/icons";
import {
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  IconButton,
  Tag,
} from "@chakra-ui/react";
import { arrayMoveImmutable } from "array-move";
import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import { Waypoint } from "./Waypoint.types";
import { getPlaceholder } from "./waypoint.utils";

export function Waypoints({
  waypoints,
  setItems,
  updateWaypoint,
  removeWaypoint,
}: {
  waypoints: Waypoint[];
  setItems: React.Dispatch<React.SetStateAction<Waypoint[]>>;
  updateWaypoint: (i: number, updatedWaypoint: Partial<Waypoint>) => void;
  removeWaypoint: (i: number) => void;
}) {
  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setItems((prevItems) => arrayMoveImmutable(prevItems, oldIndex, newIndex));
  };

  return (
    <SortableList
      onSortEnd={onSortEnd}
      className="list"
      draggedItemClassName="dragged"
      as="ul"
    >
      {waypoints.map((waypoint, i) => (
        <SortableItem key={i}>
          <li style={{ listStyle: "none" }}>
            <Flex align="center">
              <SortableKnob>
                <DragHandleIcon />
              </SortableKnob>
              <Flex align="center" justify="space-between" grow="1" px={1}>
                <Tag borderRadius="full" mr="1">
                  {i}
                </Tag>
                <div
                  title={`${waypoint.latlng.lat},${waypoint.latlng.lng}`}
                  style={{ flexGrow: 1 }}
                >
                  <Editable
                    value={waypoint.label}
                    placeholder={getPlaceholder(i, waypoints.length)}
                    onChange={(newLabel) =>
                      updateWaypoint(i, { label: newLabel })
                    }
                  >
                    <EditablePreview />
                    <EditableInput />
                  </Editable>
                </div>
                <IconButton
                  aria-label="Delete"
                  icon={<DeleteIcon />}
                  onClick={() => removeWaypoint(i)}
                  variant="ghost"
                />
              </Flex>
            </Flex>
          </li>
        </SortableItem>
      ))}
    </SortableList>
  );
}

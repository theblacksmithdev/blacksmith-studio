import { Drawer } from "@/components/shared/drawer";
import { EDGE_TYPE_OPTIONS, type CanvasSettings, type EdgeType } from "./types";
import {
  Section,
  SectionTitle,
  Row,
  RowLabel,
  SliderWrap,
  SliderValue,
  Slider,
  SegmentRow,
  SegmentBtn,
  ToggleTrack,
  ResetBtn,
  Divider,
} from "./styles";

interface CanvasSettingsDrawerProps {
  canvas: CanvasSettings;
  onUpdate: <K extends keyof CanvasSettings>(
    key: K,
    value: CanvasSettings[K],
  ) => void;
  onReset: () => void;
  onClose: () => void;
}

export function CanvasSettingsDrawer({
  canvas,
  onUpdate,
  onReset,
  onClose,
}: CanvasSettingsDrawerProps) {
  return (
    <Drawer title="Canvas Settings" onClose={onClose} size="320px">
      {/* ── Edges ── */}
      <Section>
        <SectionTitle>Edges</SectionTitle>

        <Row>
          <RowLabel>Type</RowLabel>
        </Row>
        <SegmentRow>
          {EDGE_TYPE_OPTIONS.map((opt) => (
            <SegmentBtn
              key={opt.value}
              $active={canvas.edgeType === opt.value}
              onClick={() => onUpdate("edgeType", opt.value as EdgeType)}
            >
              {opt.label}
            </SegmentBtn>
          ))}
        </SegmentRow>

        <Row style={{ marginTop: 12 }}>
          <RowLabel>Width (idle)</RowLabel>
          <SliderWrap>
            <Slider
              type="range"
              min={0.5}
              max={4}
              step={0.5}
              value={canvas.edgeWidth}
              onChange={(e) => onUpdate("edgeWidth", Number(e.target.value))}
            />
            <SliderValue>{canvas.edgeWidth}px</SliderValue>
          </SliderWrap>
        </Row>

        <Row>
          <RowLabel>Width (active)</RowLabel>
          <SliderWrap>
            <Slider
              type="range"
              min={0.5}
              max={4}
              step={0.5}
              value={canvas.edgeActiveWidth}
              onChange={(e) =>
                onUpdate("edgeActiveWidth", Number(e.target.value))
              }
            />
            <SliderValue>{canvas.edgeActiveWidth}px</SliderValue>
          </SliderWrap>
        </Row>

        <Row>
          <RowLabel>Opacity (idle)</RowLabel>
          <SliderWrap>
            <Slider
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={canvas.edgeOpacity}
              onChange={(e) => onUpdate("edgeOpacity", Number(e.target.value))}
            />
            <SliderValue>{Math.round(canvas.edgeOpacity * 100)}%</SliderValue>
          </SliderWrap>
        </Row>

        <Row>
          <RowLabel>Animate active</RowLabel>
          <ToggleTrack
            $on={canvas.edgeAnimated}
            onClick={() => onUpdate("edgeAnimated", !canvas.edgeAnimated)}
          />
        </Row>
      </Section>

      <Divider />

      {/* ── Background ── */}
      <Section>
        <SectionTitle>Background</SectionTitle>

        <Row>
          <RowLabel>Show dots</RowLabel>
          <ToggleTrack
            $on={canvas.showBackground}
            onClick={() => onUpdate("showBackground", !canvas.showBackground)}
          />
        </Row>

        {canvas.showBackground && (
          <>
            <Row>
              <RowLabel>Dot spacing</RowLabel>
              <SliderWrap>
                <Slider
                  type="range"
                  min={12}
                  max={60}
                  step={4}
                  value={canvas.backgroundGap}
                  onChange={(e) =>
                    onUpdate("backgroundGap", Number(e.target.value))
                  }
                />
                <SliderValue>{canvas.backgroundGap}</SliderValue>
              </SliderWrap>
            </Row>

            <Row>
              <RowLabel>Dot size</RowLabel>
              <SliderWrap>
                <Slider
                  type="range"
                  min={0.3}
                  max={2}
                  step={0.1}
                  value={canvas.backgroundSize}
                  onChange={(e) =>
                    onUpdate("backgroundSize", Number(e.target.value))
                  }
                />
                <SliderValue>{canvas.backgroundSize}</SliderValue>
              </SliderWrap>
            </Row>
          </>
        )}
      </Section>

      <Divider />

      {/* ── Grid ── */}
      <Section>
        <SectionTitle>Grid</SectionTitle>

        <Row>
          <RowLabel>Snap to grid</RowLabel>
          <ToggleTrack
            $on={canvas.snapToGrid}
            onClick={() => onUpdate("snapToGrid", !canvas.snapToGrid)}
          />
        </Row>

        {canvas.snapToGrid && (
          <Row>
            <RowLabel>Grid size</RowLabel>
            <SliderWrap>
              <Slider
                type="range"
                min={10}
                max={50}
                step={5}
                value={canvas.snapGridSize}
                onChange={(e) =>
                  onUpdate("snapGridSize", Number(e.target.value))
                }
              />
              <SliderValue>{canvas.snapGridSize}</SliderValue>
            </SliderWrap>
          </Row>
        )}
      </Section>

      <Divider />

      <ResetBtn onClick={onReset}>Reset to defaults</ResetBtn>
    </Drawer>
  );
}

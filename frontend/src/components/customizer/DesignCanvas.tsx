'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KImage, Text, Rect, Transformer } from 'react-konva';
import Konva from 'konva';

export type DesignElement = {
  id: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  // image
  src?: string;
  imgEl?: HTMLImageElement;
  // text
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  fontStyle?: string;
  align?: string;
};

export type PrintAreaDef = {
  x: number; y: number; width: number; height: number; // 0-100% of stage
};

type Props = {
  width: number;
  height: number;
  mockupUrl: string;
  printArea: PrintAreaDef;
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, attrs: Partial<DesignElement>) => void;
};

export type CanvasHandle = {
  toDataURL: () => string;
  toJSON: () => string;
};

// Single design element (image or text) with transformer
function DesignNode({
  el,
  isSelected,
  onSelect,
  onChange,
}: {
  el: DesignElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<DesignElement>) => void;
}) {
  const nodeRef = useRef<any>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!el.src) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = el.src;
    img.onload = () => {
      imgRef.current = img;
      forceUpdate(n => n + 1);
    };
  }, [el.src]);

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = () => {
    const node = nodeRef.current;
    if (!node) return;
    onChange({
      x: node.x(),
      y: node.y(),
      width: node.width(),
      height: node.height(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation(),
    });
  };

  const commonProps = {
    ref: nodeRef,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: el.rotation,
    scaleX: el.scaleX,
    scaleY: el.scaleY,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  return (
    <>
      {el.type === 'image' ? (
        <KImage
          {...commonProps}
          image={imgRef.current ?? undefined}
        />
      ) : (
        <Text
          {...commonProps}
          text={el.text ?? 'Your Text'}
          fontSize={el.fontSize ?? 24}
          fontFamily={el.fontFamily ?? 'Arial'}
          fill={el.fill ?? '#000000'}
          fontStyle={el.fontStyle ?? 'normal'}
          align={el.align ?? 'left'}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
          rotateEnabled
          keepRatio={el.type === 'image'}
        />
      )}
    </>
  );
}

// Mockup background layer image
function MockupImage({ url, width, height }: { url: string; width: number; height: number }) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      imgRef.current = img;
      forceUpdate(n => n + 1);
    };
  }, [url]);

  return (
    <KImage
      image={imgRef.current ?? undefined}
      width={width}
      height={height}
      listening={false}
    />
  );
}

const DesignCanvas = forwardRef<CanvasHandle, Props>(
  ({ width, height, mockupUrl, printArea, elements, selectedId, onSelect, onChange }, ref) => {
    const stageRef = useRef<Konva.Stage>(null);

    // Convert % print area to px
    const pa = {
      x: (printArea.x / 100) * width,
      y: (printArea.y / 100) * height,
      w: (printArea.width / 100) * width,
      h: (printArea.height / 100) * height,
    };

    useImperativeHandle(ref, () => ({
      toDataURL: () => {
        if (!stageRef.current) return '';
        return stageRef.current.toDataURL({ pixelRatio: 2 });
      },
      toJSON: () => {
        if (!stageRef.current) return '[]';
        return JSON.stringify(
          elements.map(({ imgEl: _imgEl, ...rest }) => rest),
        );
      },
    }));

    return (
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelect(null);
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) onSelect(null);
        }}
        className="rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Background: product mockup (non-interactive) */}
        <Layer listening={false}>
          <MockupImage url={mockupUrl} width={width} height={height} />
          {/* Semi-transparent overlay outside print area */}
          <Rect x={0} y={0} width={width} height={pa.y} fill="rgba(0,0,0,0.25)" listening={false} />
          <Rect x={0} y={pa.y} width={pa.x} height={pa.h} fill="rgba(0,0,0,0.25)" listening={false} />
          <Rect x={pa.x + pa.w} y={pa.y} width={width - pa.x - pa.w} height={pa.h} fill="rgba(0,0,0,0.25)" listening={false} />
          <Rect x={0} y={pa.y + pa.h} width={width} height={height - pa.y - pa.h} fill="rgba(0,0,0,0.25)" listening={false} />
          {/* Print area boundary */}
          <Rect
            x={pa.x} y={pa.y} width={pa.w} height={pa.h}
            stroke="#6366f1" strokeWidth={1.5}
            dash={[6, 4]}
            fill="transparent"
            listening={false}
          />
        </Layer>

        {/* Design layer: user elements */}
        <Layer
          clipX={pa.x} clipY={pa.y} clipWidth={pa.w} clipHeight={pa.h}
        >
          {elements.map((el) => (
            <DesignNode
              key={el.id}
              el={el}
              isSelected={selectedId === el.id}
              onSelect={() => onSelect(el.id)}
              onChange={(attrs) => onChange(el.id, attrs)}
            />
          ))}
        </Layer>
      </Stage>
    );
  },
);

DesignCanvas.displayName = 'DesignCanvas';
export default DesignCanvas;

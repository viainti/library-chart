import React, { useEffect, useState } from 'react';
import {
  BsCursor,
  BsSlash,
  BsDash,
  BsArrowsAngleExpand,
  BsSquare,
  BsTriangle,
  BsChevronBarExpand,
  BsType,
  BsEmojiSmile,
  BsEmojiLaughing,
  BsEmojiSunglasses,
  BsEmojiHeartEyes,
  BsEmojiDizzy,
  BsEmojiNeutral,
  BsEmojiAngry,
  BsPencil,
  BsTrash,
  BsGraphUp,
  BsGraphDown,
  BsDiagram3
} from 'react-icons/bs';
import type { DrawingTool, CursorType } from './types';
import { useChartStore } from './store';

const cursorOptions: { type: CursorType; icon: React.ReactNode; label: string }[] = [
  { type: 'cross', icon: <BsCursor />, label: 'Cross' },
  { type: 'dot', icon: <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />, label: 'Dot' },
  { type: 'arrow', icon: <BsCursor style={{ transform: 'rotate(45deg)' }} />, label: 'Arrow' },
  { type: 'eraser', icon: <BsTrash style={{ fontSize: '14px' }} />, label: 'Eraser' }
];

const lineOptions: { tool: DrawingTool; icon: React.ReactNode; label: string }[] = [
  { tool: 'trendline', icon: <BsSlash />, label: 'Trend line' },
  { tool: 'ray', icon: <BsSlash style={{ transform: 'translateX(-3px)' }} />, label: 'Ray' },
  { tool: 'info-line', icon: <BsGraphUp />, label: 'Info line' },
  { tool: 'extended-line', icon: <BsSlash style={{ width: '24px' }} />, label: 'Extended line' },
  { tool: 'trend-angle', icon: <BsSlash style={{ transform: 'rotate(15deg)' }} />, label: 'Trend angle' },
  { tool: 'horizontal', icon: <BsDash style={{ width: '22px' }} />, label: 'Horizontal segment' },
  { tool: 'horizontal-line', icon: <BsDash />, label: 'Horizontal line' },
  { tool: 'horizontal-ray', icon: <BsDash style={{ transform: 'translateX(4px)' }} />, label: 'Horizontal ray' },
  { tool: 'vertical-line', icon: <BsDash style={{ transform: 'rotate(90deg)' }} />, label: 'Vertical line' },
  { tool: 'cross-line', icon: <span style={{ fontWeight: 700 }}>✚</span>, label: 'Cross line' }
];

const channelOptions: { tool: DrawingTool; icon: React.ReactNode; label: string }[] = [
  { tool: 'parallel', icon: <BsArrowsAngleExpand />, label: 'Parallel channel' },
  { tool: 'channel', icon: <BsChevronBarExpand />, label: 'Standard channel' },
  { tool: 'regression-trend', icon: <BsGraphUp />, label: 'Regression trend' },
  { tool: 'flat-top-bottom', icon: <BsDash style={{ width: '24px' }} />, label: 'Flat top/bottom' },
  { tool: 'disjoint-channel', icon: <BsChevronBarExpand style={{ transform: 'rotate(90deg)' }} />, label: 'Disjoint channel' }
];

const pitchforkOptions: { tool: DrawingTool; icon: React.ReactNode; label: string }[] = [
  { tool: 'pitchfork', icon: <BsDiagram3 />, label: 'Pitchfork' },
  { tool: 'schiff-pitchfork', icon: <BsDiagram3 />, label: 'Schiff pitchfork' },
  { tool: 'modified-schiff-pitchfork', icon: <BsDiagram3 />, label: 'Modified Schiff' },
  { tool: 'inside-pitchfork', icon: <BsDiagram3 />, label: 'Inside pitchfork' }
];

const shapeOptions: { tool: DrawingTool; icon: React.ReactNode; label: string }[] = [
  { tool: 'rectangle', icon: <BsSquare />, label: 'Rectángulo' },
  { tool: 'triangle', icon: <BsTriangle />, label: 'Triángulo' }
];

const measurementOptions: { tool: DrawingTool; icon: React.ReactNode; label: string }[] = [
  { tool: 'fibonacci', icon: <BsGraphUp />, label: 'Fibonacci' },
  { tool: 'ruler', icon: <BsGraphDown />, label: 'Regla' }
];

const emojiOptions: Array<{ label: string; icon: React.ReactNode; value: string }> = [
  { label: 'Smile', icon: <BsEmojiSmile />, value: '🙂' },
  { label: 'Laugh', icon: <BsEmojiLaughing />, value: '😂' },
  { label: 'Heart Eyes', icon: <BsEmojiHeartEyes />, value: '😍' },
  { label: 'Sunglasses', icon: <BsEmojiSunglasses />, value: '😎' },
  { label: 'Dizzy', icon: <BsEmojiDizzy />, value: '😵' },
  { label: 'Neutral', icon: <BsEmojiNeutral />, value: '😐' },
  { label: 'Angry', icon: <BsEmojiAngry />, value: '😠' }
];

const popoverStyle: React.CSSProperties = {
  position: 'absolute',
  left: '64px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: '#020617',
  border: '1px solid #1f2937',
  borderRadius: '14px',
  padding: '10px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
  display: 'grid',
  gap: '8px',
  zIndex: 1100
};

const DrawingToolbar: React.FC = () => {
  const {
    activeTool,
    cursorType,
    strokeColor,
    strokeWidth,
    setActiveTool,
    setCursorType,
    setStrokeColor,
    setStrokeWidth,
    clearDrawings,
    setSelectedEmoji,
    setIsDrawing
  } = useChartStore();

  const [openMenu, setOpenMenu] = useState<null | 'cursor' | 'lines' | 'shapes' | 'channels' | 'pitchforks' | 'measurements'>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

const LINE_COLORS = ['#8ab4ff', '#f472b6', '#34d399', '#facc15', '#f87171', '#e2e8f0'];
const WIDTH_OPTIONS = [1, 1.5, 2.5, 3.5];



  const handleSelectTool = (tool: DrawingTool) => {
    setActiveTool(tool);
    setIsDrawing(false);
    setOpenMenu(null);
    setShowEmojiPicker(false);
  };

  const handleCursorSelect = (type: CursorType) => {
    setCursorType(type);
    setOpenMenu(null);
  };

  const toggleMenu = (menu: 'cursor' | 'lines' | 'shapes' | 'channels' | 'pitchforks' | 'measurements') => {
    setShowEmojiPicker(false);
    setOpenMenu(prev => (prev === menu ? null : menu));
  };

  const buttonConfig = [
    {
      key: 'cursor',
      icon: <BsCursor />,
      active: openMenu === 'cursor',
      onClick: () => toggleMenu('cursor'),
      title: 'Cursores'
    },
    {
      key: 'lines',
      icon: <BsSlash />,
      active: lineOptions.some(option => option.tool === activeTool) || openMenu === 'lines',
      onClick: () => toggleMenu('lines'),
      title: 'Lines'
    },
    {
      key: 'shapes',
      icon: <BsSquare />,
      active: shapeOptions.some(option => option.tool === activeTool) || openMenu === 'shapes',
      onClick: () => toggleMenu('shapes'),
      title: 'Shapes'
    },
    {
      key: 'channels',
      icon: <BsChevronBarExpand />,
      active: channelOptions.some(option => option.tool === activeTool) || openMenu === 'channels',
      onClick: () => toggleMenu('channels'),
      title: 'Channels'
    },
    {
      key: 'pitchforks',
      icon: <BsDiagram3 />,
      active: pitchforkOptions.some(option => option.tool === activeTool) || openMenu === 'pitchforks',
      onClick: () => toggleMenu('pitchforks'),
      title: 'Pitchforks'
    },
    {
      key: 'measurements',
      icon: <BsGraphUp />,
      active: measurementOptions.some(option => option.tool === activeTool) || openMenu === 'measurements',
      onClick: () => toggleMenu('measurements'),
      title: 'Mediciones'
    },
    {
      key: 'brush',
      icon: <BsPencil />,
      active: activeTool === 'freehand',
      onClick: () => handleSelectTool('freehand'),
      title: 'Brush'
    },
    {
      key: 'text',
      icon: <BsType />,
      active: activeTool === 'text',
      onClick: () => handleSelectTool('text'),
      title: 'Texto y notas'
    },
    {
      key: 'emoji',
      icon: <BsEmojiSmile />,
      active: showEmojiPicker,
      onClick: () => {
        setOpenMenu(null);
        setShowEmojiPicker(prev => !prev);
      },
      title: 'Emojis'
    },
    {
      key: 'clear',
      icon: <BsTrash />,
      active: false,
      onClick: () => {
        clearDrawings();
        setOpenMenu(null);
        setShowEmojiPicker(false);
      },
      title: 'Limpiar todo'
    }
  ];

  const filteredButtons = isCompact
    ? buttonConfig.filter(btn => !['pitchforks', 'measurements'].includes(btn.key))
    : buttonConfig;

  const buildPopoverStyle = (custom?: Partial<React.CSSProperties>): React.CSSProperties => ({
    ...popoverStyle,
    ...(isCompact
      ? { left: '0px', top: 'calc(100% + 12px)', transform: 'none', width: 'min(360px, 92vw)' }
      : {}),
    ...custom
  });

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div style={{
        height: isCompact ? 'auto' : '100%',
        width: '100%',
        display: 'flex',
        flexDirection: isCompact ? 'row' : 'column',
        alignItems: 'center',
        gap: '12px',
        overflowX: isCompact ? 'auto' : 'visible',
        padding: isCompact ? '12px 6px' : 0
      }}>
        {filteredButtons.map((btn) => (
          <div key={btn.key} style={{ position: 'relative' }}>
            <button
              onClick={btn.onClick}
              title={btn.title}
              aria-label={btn.title}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                border: `1px solid ${btn.active ? '#2563eb' : '#1f2937'}`,
                background: btn.active ? 'rgba(37,99,235,0.25)' : 'rgba(15,23,42,0.4)',
                color: btn.active ? '#f8fafc' : '#b2b5be',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                transition: 'all 0.2s'
              }}
            >
              {btn.icon}
            </button>

            {btn.key === 'cursor' && openMenu === 'cursor' && (
              <div style={buildPopoverStyle({ gridTemplateColumns: 'repeat(2, 1fr)', width: isCompact ? 'min(320px, 92vw)' : '200px' })}>
                {cursorOptions.map(option => (
                  <button
                    key={option.type}
                    onClick={() => handleCursorSelect(option.type)}
                    style={{
                      width: '84px',
                      height: '60px',
                      borderRadius: '12px',
                      border: `1px solid ${cursorType === option.type ? '#2563eb' : '#1f2937'}`,
                      background: cursorType === option.type ? 'rgba(37,99,235,0.25)' : 'rgba(2,6,23,0.6)',
                      color: '#e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    title={option.label}
                  >
                    <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{option.icon}</span>
                    <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {btn.key === 'lines' && openMenu === 'lines' && (
              <div style={buildPopoverStyle({ width: isCompact ? 'min(360px, 92vw)' : '280px' })}>
                <p style={{ margin: 0, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>Lines</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                  {lineOptions.map(option => (
                    <button
                      key={option.tool}
                      onClick={() => handleSelectTool(option.tool)}
                      style={{
                        borderRadius: '12px',
                        border: `1px solid ${activeTool === option.tool ? '#2563eb' : '#1f2937'}`,
                        background: activeTool === option.tool ? 'rgba(37,99,235,0.2)' : 'rgba(2,6,23,0.6)',
                        color: '#e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      title={option.label}
                    >
                      <span style={{ fontSize: '16px' }}>{option.icon}</span>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{option.label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>Stroke color</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {LINE_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setStrokeColor(color)}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          border: strokeColor === color ? '2px solid #f8fafc' : '2px solid transparent',
                          background: color,
                          cursor: 'pointer'
                        }}
                        aria-label={`Stroke color ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>Stroke width</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {WIDTH_OPTIONS.map(width => (
                      <button
                        key={width}
                        onClick={() => setStrokeWidth(width)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          border: strokeWidth === width ? '1px solid #2563eb' : '1px solid #1f2937',
                          background: strokeWidth === width ? 'rgba(37,99,235,0.2)' : 'rgba(2,6,23,0.6)',
                          color: '#e2e8f0',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        {width}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {btn.key === 'shapes' && openMenu === 'shapes' && (
              <div style={buildPopoverStyle({ width: isCompact ? 'min(320px, 92vw)' : '200px' })}>
                <p style={{ margin: 0, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>Shapes</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                  {shapeOptions.map(option => (
                    <button
                      key={option.tool}
                      onClick={() => handleSelectTool(option.tool)}
                      style={{
                        borderRadius: '12px',
                        border: `1px solid ${activeTool === option.tool ? '#fcd34d' : '#1f2937'}`,
                        background: activeTool === option.tool ? 'rgba(252,211,77,0.18)' : 'rgba(2,6,23,0.6)',
                        color: '#e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      title={option.label}
                    >
                      <span style={{ fontSize: '16px' }}>{option.icon}</span>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {btn.key === 'channels' && openMenu === 'channels' && (
              <div style={buildPopoverStyle({ width: isCompact ? 'min(340px, 92vw)' : '220px' })}>
                <p style={{ margin: 0, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>Channels</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                  {channelOptions.map(option => (
                    <button
                      key={option.tool}
                      onClick={() => handleSelectTool(option.tool)}
                      style={{
                        borderRadius: '12px',
                        border: `1px solid ${activeTool === option.tool ? '#22d3ee' : '#1f2937'}`,
                        background: activeTool === option.tool ? 'rgba(34,211,238,0.15)' : 'rgba(2,6,23,0.6)',
                        color: '#e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      title={option.label}
                    >
                      <span style={{ fontSize: '16px' }}>{option.icon}</span>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {btn.key === 'pitchforks' && openMenu === 'pitchforks' && (
              <div style={buildPopoverStyle({ width: isCompact ? 'min(320px, 92vw)' : '200px' })}>
                <p style={{ margin: 0, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>Pitchforks</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                  {pitchforkOptions.map(option => (
                    <button
                      key={option.tool}
                      onClick={() => handleSelectTool(option.tool)}
                      style={{
                        borderRadius: '12px',
                        border: `1px solid ${activeTool === option.tool ? '#f472b6' : '#1f2937'}`,
                        background: activeTool === option.tool ? 'rgba(244,114,182,0.15)' : 'rgba(2,6,23,0.6)',
                        color: '#e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      title={option.label}
                    >
                      <span style={{ fontSize: '16px' }}>{option.icon}</span>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {btn.key === 'measurements' && openMenu === 'measurements' && (
              <div style={buildPopoverStyle({ gridTemplateColumns: 'repeat(2, 1fr)', width: isCompact ? 'min(280px, 80vw)' : '160px' })}>
                {measurementOptions.map(option => (
                  <button
                    key={option.tool}
                    onClick={() => handleSelectTool(option.tool)}
                    style={{
                      width: '64px',
                      height: '54px',
                      borderRadius: '12px',
                      border: `1px solid ${activeTool === option.tool ? '#fbbf24' : '#1f2937'}`,
                      background: activeTool === option.tool ? 'rgba(251,191,36,0.18)' : 'rgba(2,6,23,0.6)',
                      color: '#fbbf24',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                    title={option.label}
                  >
                    <span style={{ fontSize: '16px' }}>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {btn.key === 'emoji' && showEmojiPicker && (
              <div style={buildPopoverStyle({ width: isCompact ? 'min(320px, 92vw)' : '220px' })}>
                <p style={{ margin: '0 0 6px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>Emojis</p>
                <div style={{ display: 'grid', gridTemplateColumns: isCompact ? 'repeat(4, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                  {emojiOptions.map(option => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setSelectedEmoji(option.value);
                        setActiveTool('icon');
                        setShowEmojiPicker(false);
                      }}
                      style={{
                        height: '48px',
                        borderRadius: '12px',
                        border: '1px solid #1f2937',
                        background: 'rgba(2,6,23,0.65)',
                        color: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        cursor: 'pointer'
                      }}
                      title={option.label}
                      aria-label={option.label}
                    >
                      {option.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrawingToolbar;

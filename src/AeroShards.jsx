import ShaderCanvas from './ShaderCanvas';

export default function AeroShards({
  shardColor = '#896ABD',
  accentColor = '#A855F7',
  onError,
  ...rest
}) {
  try {
    if (!document.createElement('canvas').getContext('webgl2')) {
      onError?.();
    }
  } catch {
    onError?.();
  }

  return (
    <ShaderCanvas
      primary={shardColor}
      secondary={accentColor}
      background="#07060d"
      {...rest}
    />
  );
}

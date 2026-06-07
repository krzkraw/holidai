export function getCompactLengthLabel(length: string): string {
  return length.trim();
}

export function getCompactVariantLabel(variant: string, selected: boolean): string {
  return selected ? getVariantSummary(variant) : getVariantLetter(variant);
}

export function getVariantLetter(variant: string): string {
  const trimmedVariant = variant.trim();
  const separatorIndex = trimmedVariant.indexOf('—');
  const prefix = separatorIndex > 0 ? trimmedVariant.slice(0, separatorIndex).trim() : trimmedVariant;

  return prefix.slice(0, 1);
}

function getVariantSummary(variant: string): string {
  const trimmedVariant = variant.trim();
  const summary = trimmedVariant.split(':', 1)[0]?.trim() || trimmedVariant;

  return summary.replace(/\s+—\s+/, ' - ');
}

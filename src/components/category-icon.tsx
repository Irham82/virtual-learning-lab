import React from 'react';
import {
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Network,
  Globe,
  Cpu,
  Layers,
  Microscope,
  Compass,
  Code2,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends Omit<LucideProps, 'name'> {
  name?: string | null;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  switch (name?.toLowerCase()) {
    case 'calculator':
    case 'matematika':
      return <Calculator {...props} />;
    case 'atom':
    case 'ipa-fisika':
    case 'fisika':
      return <Atom {...props} />;
    case 'flaskconical':
    case 'kimia':
      return <FlaskConical {...props} />;
    case 'dna':
    case 'biologi':
      return <Dna {...props} />;
    case 'network':
    case 'informatika':
    case 'tkj':
      return <Network {...props} />;
    case 'globe':
    case 'astronomi':
      return <Globe {...props} />;
    case 'cpu':
    case 'elektronika':
      return <Cpu {...props} />;
    case 'microscope':
      return <Microscope {...props} />;
    case 'compass':
      return <Compass {...props} />;
    case 'code':
      return <Code2 {...props} />;
    default:
      return <Layers {...props} />;
  }
}

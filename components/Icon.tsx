import * as React from 'react';
import { IssueCategory } from '../types';
import { CATEGORY_ICONS } from '../constants';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  category: IssueCategory;
}

const Icon: React.FC<IconProps> = ({ category, ...props }) => {
  const IconComponent = CATEGORY_ICONS[category];
  return IconComponent ? <IconComponent {...props} /> : null;
};

export default Icon;
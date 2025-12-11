import {memo} from 'react';
import clsx from 'clsx';

import {Link} from '~/components/Link';
import {Svg} from '~/components/Svg';
import {useMenu} from '~/hooks';

export const NavigationLogo = memo(
  ({className = '', color}: {className?: string; color?: string}) => {
    const {closeAll} = useMenu();

    return (
      <Link
        aria-label="Go to homepage"
        className={clsx('flex items-center justify-center text-text', className)}
        onClick={closeAll}
        style={{color}}
        to="/"
      >
        <Svg
          className="h-14 px-2 text-current"
          src="/svgs/brilliant-layers-logo.svg#brilliant-layers-logo"
          title="Brilliant Layers logo"
          viewBox="0 0 180 180"
        />
        <h3 className="text-2xl font-medium uppercase md:flex">
          Brilliant Layers
        </h3>
      </Link>
    );
  },
);

NavigationLogo.displayName = 'NavigationLogo';

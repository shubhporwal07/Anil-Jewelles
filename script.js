const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/Navbar.jsx', 'utf8');

// Target 1: Desktop links
const target1 = `<div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <Link to="/dashboard?category=all" className={navLinkClass}>
              Fine Jewellery
            </Link>
            <Link to="/dashboard?category=engagement" className={navLinkClass}>
              Engagement
            </Link>
            <Link to="/dashboard?category=mens" className={navLinkClass}>
              Men&apos;s
            </Link>
            <Link to="/about-us" className={navLinkClass}>
              About Us
            </Link>
          </div>`;
          
const replace1 = `{user && (
          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <Link to="/dashboard?category=all" className={navLinkClass}>
              Fine Jewellery
            </Link>
            <Link to="/dashboard?category=engagement" className={navLinkClass}>
              Engagement
            </Link>
            <Link to="/dashboard?category=mens" className={navLinkClass}>
              Men&apos;s
            </Link>
            <Link to="/about-us" className={navLinkClass}>
              About Us
            </Link>
          </div>
          )}`;

content = content.replace(target1.replace(/\r/g, ''), replace1.replace(/\r/g, ''));
content = content.replace(target1.replace(/\n/g, '\r\n'), replace1.replace(/\n/g, '\r\n'));

// Target 2: Cart icon
const target2 = `<Link
              to="/cart"
              className="relative p-2 text-slate-700 transition hover:text-slate-900"
              title="Cart"
              aria-label="Shopping bag"
              onClick={closeMobile}
            >
              <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
              {totalCartItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white">
                  {totalCartItems}
                </span>
              )}
            </Link>`;

const replace2 = `{user && (
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 transition hover:text-slate-900"
              title="Cart"
              aria-label="Shopping bag"
              onClick={closeMobile}
            >
              <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
              {totalCartItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white">
                  {totalCartItems}
                </span>
              )}
            </Link>
            )}`;

content = content.replace(target2.replace(/\r/g, ''), replace2.replace(/\r/g, ''));
content = content.replace(target2.replace(/\n/g, '\r\n'), replace2.replace(/\n/g, '\r\n'));

fs.writeFileSync('frontend/src/components/Navbar.jsx', content);

const Icon = ({ d, size = 16, sw = 1.5, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

export const Icons = {
  search:       (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></Icon>,
  plus:         (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  chevronDown:  (p) => <Icon {...p} d="m6 9 6 6 6-6" />,
  chevronLeft:  (p) => <Icon {...p} d="m15 18-6-6 6-6" />,
  chevronRight: (p) => <Icon {...p} d="m9 18 6-6-6-6" />,
  close:        (p) => <Icon {...p} d="M18 6 6 18M6 6l12 12" />,
  edit:         (p) => <Icon {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></Icon>,
  trash:        (p) => <Icon {...p}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></Icon>,
  more:         (p) => <Icon {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></Icon>,
  dot:          (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /></Icon>,
  sort:         (p) => <Icon {...p} d="m7 15 5 5 5-5M7 9l5-5 5 5" />,
  sortUp:       (p) => <Icon {...p} d="m7 14 5-5 5 5" />,
  sortDown:     (p) => <Icon {...p} d="m7 10 5 5 5-5" />,
  users:        (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>,
  wallet:       (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" /><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z" /><circle cx="16.5" cy="13" r="1" /></Icon>,
  building:     (p) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" /></Icon>,
  pulse:        (p) => <Icon {...p} d="M3 12h4l3 8 4-16 3 8h4" />,
  check:        (p) => <Icon {...p} d="m5 12 5 5L20 6" />,
  download:     (p) => <Icon {...p}><path d="M12 3v12" /><path d="m7 11 5 4 5-4" /><path d="M5 21h14" /></Icon>,
  mail:         (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon>,
  phone:        (p) => <Icon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" /></Icon>,
};

export default Icon;

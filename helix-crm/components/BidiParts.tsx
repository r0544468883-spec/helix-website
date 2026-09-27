import { Fragment } from 'react';

// A meta line like "מנכ"לית · Nurit Ltd. · ron@nurit.co" in the screen's direction.
// The line itself follows the locale (right-aligned in Hebrew, parts in reading
// order); each part is a <bdi>, so a Latin name or an email keeps its own order and
// punctuation. See DESIGN.md §11.
export default function BidiParts({ parts }: { parts: (string | null | undefined)[] }) {
  return (
    <>
      {parts.filter(Boolean).map((p, i) => (
        <Fragment key={i}>
          {i > 0 && ' · '}
          <bdi>{p}</bdi>
        </Fragment>
      ))}
    </>
  );
}

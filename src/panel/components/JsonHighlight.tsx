import { Highlight, themes } from "prism-react-renderer";
import { ScrollArea } from "@mantine/core";
import styles from "../styles/JsonHighlight.module.css";

interface JsonHighlightProps {
  code: string;
  language?: string;
  lineWrap?: boolean;
  withLineNumbers?: boolean;
  opacity?: number;
  className?: string;
}

export default function JsonHighlight({ code, language = "json", lineWrap = true, withLineNumbers = false, opacity = 1, className }: JsonHighlightProps) {
  return (
    <Highlight theme={themes.vsDark} code={code} language={language}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={` ${className} ${styles.pre}`}
          style={{
            ...style,
            opacity,
            overflow: lineWrap ? "hidden" : "auto",
          }}
        >
          <ScrollArea type="hover" scrollbarSize={4} dir="ltr" offsetScrollbars={false}>
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line });
              return (
                <div key={i} {...lineProps} className={styles.container} style={{ gridTemplateColumns: withLineNumbers ? `${tokens.length.toString().length}ch 1fr` : "1fr", columnGap: withLineNumbers ? "1em" : 0 }}>
                  {withLineNumbers && <span className={styles.lineNumbers}>{i + 1}</span>}
                  <span className={lineWrap ? styles.textWithLineWrap : styles.text}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              );
            })}
          </ScrollArea>
        </pre>
      )}
    </Highlight>
  );
}

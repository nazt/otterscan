import { useState, useEffect } from "react";
import { sourcifyMetadata, SourcifySource, sourcifySourceFile } from "./url";

export type Metadata = {
  version: string;
  language: string;
  compiler: {
    version: string;
    keccak256?: string | undefined;
  };
  sources: {
    [filename: string]: {
      keccak256: string;
      content?: string | undefined;
      urls?: string[];
      license?: string;
    };
  };
  settings: {
    remappings: string[];
    optimizer?: {
      enabled: boolean;
      runs: number;
    };
    compilationTarget: {
      [filename: string]: string;
    };
    libraries: {
      [filename: string]: string;
    };
  };
  output: {
    abi: any[];
    userdocs: any[];
    devdoc: any[];
  };
};

export const useSourcify = (
  checksummedAddress: string | undefined,
  chainId: number | undefined,
  source: SourcifySource
) => {
  const [rawMetadata, setRawMetadata] = useState<Metadata | null | undefined>();

  useEffect(() => {
    if (!checksummedAddress || chainId === undefined) {
      return;
    }

    setRawMetadata(undefined);
    const fetchMetadata = async () => {
      try {
        const contractMetadataURL = sourcifyMetadata(
          checksummedAddress,
          chainId,
          source
        );
        const result = await fetch(contractMetadataURL);
        if (result.ok) {
          const _metadata = await result.json();
          setRawMetadata(_metadata);
        } else {
          setRawMetadata(null);
        }
      } catch (err) {
        console.error(err);
        setRawMetadata(null);
      }
    };
    fetchMetadata();
  }, [checksummedAddress, chainId, source]);

  return rawMetadata;
};

export const useContract = (
  checksummedAddress: string,
  networkId: number,
  filename: string,
  source: any,
  sourcifySource: SourcifySource
) => {
  const [content, setContent] = useState<string>(source.content);

  useEffect(() => {
    if (source.content) {
      return;
    }

    const readContent = async () => {
      const normalizedFilename = filename.replaceAll(/[@:]/g, "_");
      const url = sourcifySourceFile(
        checksummedAddress,
        networkId,
        normalizedFilename,
        sourcifySource
      );
      const res = await fetch(url);
      if (res.ok) {
        const _content = await res.text();
        setContent(_content);
      }
    };
    readContent();
  }, [checksummedAddress, networkId, filename, source.content, sourcifySource]);

  return content;
};

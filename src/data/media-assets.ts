/**
 * Owner Drive folder → imported static asset mapping.
 * Folder purposes are authoritative; each folder contained exactly one final file.
 */

export type MediaAssetSlot =
  | "heroDesktop"
  | "heroMobile"
  | "sizeGuideBaggy"
  | "sizeGuideStraight";

export type MediaAssetRecord = {
  slot: MediaAssetSlot;
  purpose: string;
  driveFolderId: string;
  driveFolderUrl: string;
  driveFolderTitle: string;
  driveFileId: string;
  driveOriginalName: string;
  mimeType: string;
  localPath: string;
  posterPath?: string;
  retrieved: true;
  verified: true;
  notes?: string;
};

export const MEDIA_ASSETS: Record<MediaAssetSlot, MediaAssetRecord> = {
  heroDesktop: {
    slot: "heroDesktop",
    purpose: "Homepage hero video — laptop/desktop (≥768px)",
    driveFolderId: "1U6-LQ7mRJVZI2HFUD5yGRy5oOuE4wand",
    driveFolderUrl:
      "https://drive.google.com/drive/folders/1U6-LQ7mRJVZI2HFUD5yGRy5oOuE4wand?usp=sharing",
    driveFolderTitle: "hero for laptop",
    driveFileId: "1Qdj4wt18hAVrz65rc5Se_HD4cNOprwFY",
    driveOriginalName: "EBF12FB2-08D9-4C01-A26E-C1ACB47F79C6.MP4",
    mimeType: "video/mp4",
    localPath: "/heroes/hero-laptop.mp4",
    posterPath: "/heroes/hero-laptop-poster.jpg",
    retrieved: true,
    verified: true,
    notes: "1920×1080, ~10s, H.264",
  },
  heroMobile: {
    slot: "heroMobile",
    purpose: "Homepage hero video — phone (<768px)",
    driveFolderId: "1Z03U_EtznDXJv7crx5eug84CbT0WWBr3",
    driveFolderUrl:
      "https://drive.google.com/drive/folders/1Z03U_EtznDXJv7crx5eug84CbT0WWBr3?usp=sharing",
    driveFolderTitle: "hero for phone",
    driveFileId: "1rrLgYNSRf19mIpoUWoitzVDPJNL-AdxU",
    driveOriginalName: "IMG_1872.MP4 Comp 1_1.MP4",
    mimeType: "video/mp4",
    localPath: "/heroes/hero-phone.mp4",
    posterPath: "/heroes/hero-phone-poster.jpg",
    retrieved: true,
    verified: true,
    notes: "1080×1920, ~10s, H.264",
  },
  sizeGuideBaggy: {
    slot: "sizeGuideBaggy",
    purpose: "Size guide image for all six baggy jeans",
    driveFolderId: "1tF54KhoRbKEvMY613mBjK9Zo32s1VbkD",
    driveFolderUrl:
      "https://drive.google.com/drive/folders/1tF54KhoRbKEvMY613mBjK9Zo32s1VbkD?usp=sharing",
    driveFolderTitle: "baggy size guide",
    driveFileId: "1vdJwThXTRCTGKB4oKTR0_rvUazmto4mr",
    driveOriginalName: "60C19515-67F6-4B9E-9FCF-AA8210807739.PNG",
    mimeType: "image/png",
    localPath: "/size-guides/baggy-size-guide.png",
    retrieved: true,
    verified: true,
  },
  sizeGuideStraight: {
    slot: "sizeGuideStraight",
    purpose: "Size guide image for all six straight-fit jeans",
    driveFolderId: "1WFea66KuOl2eKBDQyV6a4ofA7nC0dEaF",
    driveFolderUrl:
      "https://drive.google.com/drive/folders/1WFea66KuOl2eKBDQyV6a4ofA7nC0dEaF?usp=sharing",
    driveFolderTitle: "straight fit size guide",
    driveFileId: "1jYFsAvTvUTq1R-bSSAWo7KgUB7bOflQw",
    driveOriginalName: "9A6F25CE-A81E-4707-9393-1A8C8C3D2DA3.PNG",
    mimeType: "image/png",
    localPath: "/size-guides/straight-fit-size-guide.png",
    retrieved: true,
    verified: true,
  },
};

export const HERO_BREAKPOINT_PX = 768;

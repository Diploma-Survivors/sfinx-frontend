export const metadata = {
  title: "SFINX - Đồ án tốt nghiệp | HCMUS",
  description: "Hệ thống phỏng vấn kỹ thuật với AI - Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM",
};

export default function PosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="poster-body">
        {children}
      </body>
    </html>
  );
}

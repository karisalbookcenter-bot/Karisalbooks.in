interface BookSocialPosterProps {
  title: string;
  coverImageUrl: string;
  logoUrl: string;
  categoryName: string;
  originalPrice: string;
  discountedPrice: string;
  discountLabel: string;
  freeDelivery: boolean;
  orderUrl: string;
  storeName: string;
}

export function BookSocialPoster({
  title,
  coverImageUrl,
  logoUrl,
  categoryName,
  originalPrice,
  discountedPrice,
  discountLabel,
  freeDelivery,
  orderUrl,
  storeName,
}: BookSocialPosterProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 54,
        color: "#17382b",
        background:
          "radial-gradient(circle at 85% 10%, #e7d4a6 0, #f5f0e3 28%, #fffdf7 72%)",
        fontFamily: "Noto Sans Tamil",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 76,
          borderBottom: "1px solid #d9dfd4",
          paddingBottom: 22,
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            width={190}
            height={58}
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
        ) : (
          <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>
            KARISAL BOOKS
          </span>
        )}
        <span
          style={{
            border: "1px solid #b7c6b9",
            borderRadius: 999,
            padding: "10px 18px",
            color: "#41644e",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          NEW ARRIVAL
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          gap: 42,
          paddingTop: 34,
          paddingBottom: 30,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 420,
            height: 690,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #e5e1d6",
            borderRadius: 26,
            background: "#ffffff",
            padding: 24,
            boxShadow: "0 24px 55px rgba(23, 56, 43, 0.16)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImageUrl}
            alt=""
            width={370}
            height={640}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              color: "#b17724",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {categoryName || "A good book"}
          </span>
          <h1
            style={{
              display: "flex",
              margin: "20px 0 18px",
              fontSize: title.length > 48 ? 42 : title.length > 28 ? 50 : 58,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: "0 0 30px",
              color: "#637269",
              fontSize: 22,
              lineHeight: 1.4,
            }}
          >
            A thoughtful read, now available at Karisal Books.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              border: "1px solid #e4dfd1",
              borderRadius: 20,
              background: "#ffffff",
              padding: "24px 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ color: "#17382b", fontSize: 42, fontWeight: 800 }}>
                {discountedPrice}
              </span>
              {discountLabel && (
                <span
                  style={{
                    borderRadius: 999,
                    background: "#fff0c2",
                    color: "#744b06",
                    padding: "8px 12px",
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  {discountLabel}
                </span>
              )}
              {freeDelivery && (
                <span
                  style={{
                    borderRadius: 999,
                    background: "#dff1e5",
                    color: "#20543a",
                    padding: "8px 12px",
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  FREE DELIVERY
                </span>
              )}
            </div>
            {originalPrice !== discountedPrice && (
              <span
                style={{
                  marginTop: 5,
                  color: "#778078",
                  fontSize: 19,
                  textDecoration: "line-through",
                }}
              >
                {originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 22,
          background: "#17382b",
          color: "#ffffff",
          padding: "22px 28px",
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>
          ORDER ONLINE
        </span>
        <span
          style={{
            maxWidth: 590,
            overflow: "hidden",
            color: "#e2eadf",
            fontSize: 17,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {orderUrl}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 18,
          color: "#607166",
          fontSize: 15,
          letterSpacing: 1.5,
        }}
      >
        {storeName}
      </div>
    </div>
  );
}

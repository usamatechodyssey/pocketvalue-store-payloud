// src/app/api/og/route.tsx
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Data URL se nikalo
    const title = searchParams.get('title')?.slice(0, 100) || 'PocketValue Store';
    const price = searchParams.get('price');
    const image = searchParams.get('image');
    const brand = searchParams.get('brand') || 'PocketValue';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'linear-gradient(to bottom right, #fff 50%, #FFF7ED 100%)',
          }}
        >
          {/* Left Side: Text Details */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '60%', padding: '60px' }}>
            {/* Brand Logo / Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
               <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FF8F32' }} />
               <span style={{ fontSize: 24, fontWeight: 700, color: '#FF8F32' }}>{brand}</span>
            </div>

            {/* Product Title */}
            <h1 style={{ fontSize: 60, fontWeight: 900, color: '#111827', margin: 0, lineHeight: 1.1 }}>
              {title}
            </h1>

            {/* Price Tag */}
            {price && (
              <div style={{ 
                  marginTop: '40px', 
                  display: 'flex', 
                  backgroundColor: '#111827', 
                  color: 'white', 
                  padding: '15px 30px', 
                  borderRadius: '50px',
                  fontSize: 32,
                  fontWeight: 600
              }}>
                Rs. {price}
              </div>
            )}
          </div>

          {/* Right Side: Product Image */}
          <div style={{ 
              display: 'flex', 
              width: '40%', 
              height: '100%', 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: '#FFF7ED',
              borderLeft: '1px solid #FED7AA'
          }}>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={image} 
                alt={title} 
                style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
              />
            ) : (
               <div style={{ fontSize: 100 }}>🛍️</div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
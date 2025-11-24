import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks hoisted
const mocks = vi.hoisted(() => {
  const mockSupabase = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
    update: vi.fn(),
    single: vi.fn()
  };

  // Configurar encadenamiento básico
  mockSupabase.from.mockReturnValue(mockSupabase);
  mockSupabase.select.mockReturnValue(mockSupabase);
  mockSupabase.eq.mockReturnValue(mockSupabase);
  mockSupabase.in.mockReturnValue(mockSupabase);
  mockSupabase.limit.mockReturnValue(mockSupabase);
  mockSupabase.update.mockReturnValue(mockSupabase);

  return {
    create: vi.fn().mockResolvedValue({
      data: {
        id: 'oauth-file-id',
        webViewLink: 'http://oauth-link.com',
        webContentLink: 'http://oauth-content-link.com'
      }
    }),
    supabase: mockSupabase
  };
});

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mocks.supabase)
}));

// Mock Google APIs
vi.mock('googleapis', () => {
  return {
    google: {
      auth: {
        OAuth2: class MockOAuth2 {
          setCredentials() {}
          refreshAccessToken() { return Promise.resolve({ credentials: {} }); }
        },
        GoogleAuth: class MockGoogleAuth {
          constructor() {}
          getClient() { return Promise.resolve({}); }
        }
      },
      drive: vi.fn().mockReturnValue({
        files: {
          create: mocks.create,
          delete: vi.fn().mockResolvedValue({})
        }
      })
    }
  };
});

import { uploadFileToDrive } from './google-drive';

describe('Google Drive Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload a file using OAuth', async () => {
    // Setup Supabase mocks for getOAuthClient
    
    // 1. Mock admin profiles query: .eq('role', 'admin')
    mocks.supabase.eq.mockImplementation((field, value) => {
        if (field === 'role' && value === 'admin') {
            return Promise.resolve({ data: [{ id: 'admin-user-id' }], error: null });
        }
        return mocks.supabase;
    });

    // 2. Mock tokens query: .maybeSingle()
    mocks.supabase.maybeSingle.mockResolvedValue({
      data: {
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        expires_at: new Date(Date.now() + 10000).toISOString(),
        user_id: 'admin-user-id'
      },
      error: null
    });

    const buffer = Buffer.from('oauth content');
    const fileName = 'oauth-test.docx';
    
    const result = await uploadFileToDrive(buffer, fileName);

    expect(result).toEqual({
      fileId: 'oauth-file-id',
      webViewLink: 'http://oauth-link.com',
      webContentLink: 'http://oauth-content-link.com'
    });

    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      requestBody: expect.objectContaining({
        name: fileName
      })
    }));
  });
});

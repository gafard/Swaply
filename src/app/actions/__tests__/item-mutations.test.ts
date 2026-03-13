import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publishItem } from '../item-mutations';
import { getCurrentUser } from '@/lib/auth';
import { actionFail } from '@/lib/actions/result';

// Mock dependencies
vi.mock('@/lib/auth');

describe('publishItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return auth_required if no user is found', async () => {
    (getCurrentUser as any).mockResolvedValue(null);
    const formData = new FormData();
    const result = await publishItem(formData);
    expect(result.code).toBe('auth_required');
  });

  it('should return title_invalid if title is too short', async () => {
    (getCurrentUser as any).mockResolvedValue({ id: 'user-1' });
    const formData = new FormData();
    formData.append('title', 'a');
    formData.append('creditValue', '10');
    formData.append('imageUrls', JSON.stringify(['https://example.com/1.jpg', 'https://example.com/2.jpg']));
    
    const result = await publishItem(formData);
    expect(result.code).toBe('title_invalid');
  });

  it('should return images_required if fewer than 2 images are provided', async () => {
    (getCurrentUser as any).mockResolvedValue({ id: 'user-1' });
    const formData = new FormData();
    formData.append('title', 'Valid Title');
    formData.append('creditValue', '10');
    formData.append('imageUrls', JSON.stringify(['https://example.com/1.jpg']));
    
    const result = await publishItem(formData);
    expect(result.code).toBe('images_required');
  });

  it('should return location_unavailable if location IDs are missing', async () => {
    (getCurrentUser as any).mockResolvedValue({ id: 'user-1' });
    const formData = new FormData();
    formData.append('title', 'Valid Title');
    formData.append('description', 'Valid Description');
    formData.append('creditValue', '10');
    formData.append('imageUrls', JSON.stringify(['https://example.com/1.jpg', 'https://example.com/2.jpg']));
    // missing location IDs
    
    const result = await publishItem(formData);
    expect(result.code).toBe('location_unavailable');
  });
});

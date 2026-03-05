import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth';

export function tenantScope(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Default tenant
  let tenantId = 1;

  // Get tenant_id from token payload (set during auth)
  if ((req as any)._tenantId) {
    tenantId = (req as any)._tenantId;
  }

  // Super admin can override tenant via query param
  if (req.user && (req as any)._isSuperAdmin && req.query.tenant_id) {
    const override = Number(req.query.tenant_id);
    if (Number.isInteger(override) && override > 0) {
      tenantId = override;
    }
  }

  (req as any).tenantId = tenantId;
  next();
}

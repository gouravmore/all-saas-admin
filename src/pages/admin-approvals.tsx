import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { getAllApprovalRequests, updateApprovalRequest } from "@/services/CohortService/cohortService";
import { showToastMessage } from "@/components/Toastify";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

interface ApprovalRequest {
  tenantName: string;
  domain: string;
  approvalId: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    name: string;
    email: string;
  };
}

const AdminApprovalsContent: React.FC = () => {
  const { t } = useTranslation();
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApprovalRequests = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);
      
      setError(null);
      const response = await getAllApprovalRequests(page, 10);
      
      if (response?.responseCode === 200 && response?.result) {
        setApprovalRequests(response.result.data || []);
        setTotal(response.result.total || 0);
        setTotalPages(Math.ceil((response.result.total || 0) / 10));
      } else {
        setError("Failed to fetch approval requests");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch approval requests");
      showToastMessage(err.message || "Failed to fetch approval requests", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApprovalRequests();
  }, [page]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon color="success" />;
      case "rejected":
        return <CancelIcon color="error" />;
      case "pending":
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { color: "warning" as const, label: "Pending" },
      approved: { color: "success" as const, label: "Approved" },
      rejected: { color: "error" as const, label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Chip
        icon={getStatusIcon(status)}
        label={config.label}
        color={config.color}
        variant="outlined"
        size="small"
      />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRefresh = () => {
    fetchApprovalRequests(true);
  };

  const handleAction = (request: ApprovalRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    setActionLoading(true);
    try {
      const status = actionType === 'approve' ? 'approved' : 'rejected';
      const response = await updateApprovalRequest(selectedRequest.approvalId, status);
      
      if (response?.responseCode === 200) {
        showToastMessage(
          `Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`,
          "success"
        );
        setActionDialogOpen(false);
        setSelectedRequest(null);
        setActionType(null);
        fetchApprovalRequests();
      } else {
        showToastMessage("Failed to update request", "error");
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to update request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setActionDialogOpen(false);
    setSelectedRequest(null);
    setActionType(null);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h1">{t("ADMIN_APPROVALS.TITLE")}</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {approvalRequests.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <InfoIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("ADMIN_APPROVALS.NO_REQUESTS_FOUND")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("ADMIN_APPROVALS.NO_REQUESTS_DESCRIPTION")}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell>{t("ADMIN_APPROVALS.REQUEST_ID")}</TableCell> */}
                  <TableCell>{t("ADMIN_APPROVALS.TENANT_NAME")}</TableCell>
                  <TableCell>{t("ADMIN_APPROVALS.USER_NAME")}</TableCell>
                  <TableCell>{t("ADMIN_APPROVALS.USER_EMAIL")}</TableCell>
                  <TableCell>{t("ADMIN_APPROVALS.STATUS")}</TableCell>
                  <TableCell>{t("ADMIN_APPROVALS.CREATED_DATE")}</TableCell>
                  <TableCell>{t("ADMIN_APPROVALS.UPDATED_DATE")}</TableCell>
                  <TableCell>{t("ADMIN_APPROVALS.ACTIONS")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvalRequests.map((request) => (
                  <TableRow key={request.tenantName} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {request.tenantName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {request.user.name}
                      </Typography>
                      {/* <Typography variant="caption" color="text.secondary">
                        @{request.user.username}
                      </Typography> */}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(request.status)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleAction(request, 'approve')}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleAction(request, 'reject')}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      {request.status !== 'pending' && (
                        <Typography variant="body2" color="text.secondary">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {refreshing && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? t("ADMIN_APPROVALS.APPROVE_REQUEST") : t("ADMIN_APPROVALS.REJECT_REQUEST")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {actionType === 'approve' 
              ? t("ADMIN_APPROVALS.APPROVE_CONFIRMATION")
              : t("ADMIN_APPROVALS.REJECT_CONFIRMATION")
            }
          </Typography>
          {selectedRequest && (
            <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {t("ADMIN_APPROVALS.REQUEST_DETAILS")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>{t("ADMIN_APPROVALS.USER_NAME")}:</strong> {selectedRequest.user.name}
              </Typography>
              <Typography variant="body2">
                <strong>{t("ADMIN_APPROVALS.USER_EMAIL")}:</strong> {selectedRequest.user.email}
              </Typography>
              <Typography variant="body2">
                <strong>{t("ADMIN_APPROVALS.REQUEST_ID")}:</strong> {selectedRequest.approvalId}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionLoading}>
            {t("COMMON.CANCEL")}
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              actionType === 'approve' ? t("ADMIN_APPROVALS.APPROVE") : t("ADMIN_APPROVALS.REJECT")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

const AdminApprovals: React.FC = () => {
  return (
    <RoleProtectedRoute requiredRoles={["super_admin"]}>
      <AdminApprovalsContent />
    </RoleProtectedRoute>
  );
};

export default AdminApprovals;

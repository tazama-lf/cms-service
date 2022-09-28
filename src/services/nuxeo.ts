import { config } from '../config';
import { LoggerService } from '../utils/logger';
import axios from 'axios';

export const sendReportResult = async (request: any) => {
  const toCreateNote = {
    'entity-type': 'document',
    repository: 'default',
    path: `/${config.nuxeoFolderPath}/null`,
    type: 'Note',
    parentRef: `${config.nuxeoFolderId}`,
    isCheckedOut: true,
    properties: {
      'note:note': null,
      'note:mime_type': 'text/plain',
    },
    schemas: [],
    name: `${request.transactionID}`,
  };

  const host = config.nuxeoHost;
  const createNoteResponse: any = await axios.post(`${host}/v1/path/${config.nuxeoFolderPath}`, toCreateNote, {
    headers: {
      Authorization: config.nuxeoAuth,
    },
  });

  if (createNoteResponse.status !== 201) {
    LoggerService.error(`Error while sending request to Nuxeo with error: ${createNoteResponse.data}`);
    return;
  }

  const noteId = createNoteResponse.data.uid;
  const toAddReport = {
    'entity-type': 'document',
    uid: `${noteId}`,
    properties: {
      'note:note': `${JSON.stringify(request, null, 2)}`,
    },
  };

  const addReportReponse = await axios.put(`${host}/v1/id/${noteId}`, toAddReport, {
    headers: {
      Authorization: config.nuxeoAuth,
    },
  });

  if (addReportReponse.status !== 200) {
    LoggerService.error(`Error while sending request to Nuxeo with error: ${addReportReponse.data}`);
    return;
  }

  const toIntializeWorkflow = {
    'entity-type': 'workflow',
    workflowModelName: 'SerialDocumentReview',
    attachedDocumentIds: [`${noteId}`],
  };

  const workflowResponse = await axios.post(`${host}/v1/id/${noteId}/@workflow`, toIntializeWorkflow, {
    headers: {
      Authorization: config.nuxeoAuth,
    },
  });

  if (workflowResponse.status !== 201) {
    LoggerService.error(`Error while sending request to Nuxeo with error: ${workflowResponse.data}`);
  }
}

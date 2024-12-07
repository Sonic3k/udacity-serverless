import { useAuth0 } from '@auth0/auth0-react'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Form } from 'semantic-ui-react'
import { getUploadUrl, uploadFile, patchTodo } from '../api/todos-api'

const UploadState = {
  NoUpload: 'NoUpload',
  FetchingPresignedUrl: 'FetchingPresignedUrl',
  UploadingFile: 'UploadingFile'
}

const audience = `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`;

export function EditTodo() {
  const [file, setFile] = useState(undefined)
  const [uploadState, setUploadState] = useState(UploadState.NoUpload)
  const { getAccessTokenSilently } = useAuth0()
  const { todoId } = useParams()
  const navigate = useNavigate()

  function renderButton() {
    return (
      <div>
        {uploadState === UploadState.FetchingPresignedUrl && (
          <p>Uploading image metadata</p>
        )}
        {uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button loading={uploadState !== UploadState.NoUpload} type="submit">
          Upload
        </Button>
      </div>
    )
  }

  function handleFileChange(event) {
    const files = event.target.files
    if (!files || !files[0]) return

    setFile(files[0])
    console.log('Selected file:', files[0].name)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      if (!file) {
        alert('File should be selected')
        return
      }

      setUploadState(UploadState.FetchingPresignedUrl)
      const accessToken = await getAccessTokenSilently({
        audience,
        scope: 'write:todo'
      })
      const uploadUrl = await getUploadUrl(accessToken, todoId, file.name)
      console.log('Upload URL:', uploadUrl)

      setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, file)

      const attachmentUrl = `https://${process.env.REACT_APP_TODOS_S3_BUCKET}.s3.amazonaws.com/${todoId}-${file.name}`
      console.log('Attachment URL:', attachmentUrl)

      await patchTodo(accessToken, todoId, {
        name: "Image Upload",
        dueDate: new Date().toISOString().split('T')[0],
        done: false,
        attachmentUrl
      })

      alert('File was uploaded!')
      navigate('/')
    } catch (e) {
      console.error('Upload error:', e)
      alert('Could not upload a file: ' + e.message)
    } finally {
      setUploadState(UploadState.NoUpload)
    }
  }

  return (
    <div>
      <h1>Upload new image</h1>

      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label>File</label>
          <input
            type="file"
            accept="image/*"
            placeholder="Image to upload"
            onChange={handleFileChange}
          />
        </Form.Field>

        {renderButton()}
      </Form>
    </div>
  )
}
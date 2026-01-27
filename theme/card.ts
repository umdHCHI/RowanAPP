import { StyleSheet } from 'react-native'

export const cardBase = StyleSheet.create({
  container: {
    backgroundColor: '#F3EFEA', // parchment tone
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C9BFAF',
    padding: 16,
    marginVertical: 8,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E2F4F', // muted purple
  },
  body: {
    fontSize: 14,
    color: '#4B4B4B',
    lineHeight: 20,
  },
})
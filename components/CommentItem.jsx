import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import Avatar from './Avatar';
import moment from 'moment';
import Icon from '../assets/icons';
import { supabase } from '../lib/supabase';

const CommentItem = ({
  item,
  currentUser,
  Group, // Pass group as a prop
  onDelete = () => {},
  highlight = false,
  canDelete = false,
}) => {
  const [userGroup, setUserGroup] = useState(Group); // Use group passed from parent

  useEffect(() => {
    // If group is not provided, fetch it
    if (!Group) {
      const fetchUserGroup = async () => {
        try {
          const { data: authUser, error: authError } = await supabase.auth.getUser();

          if (authError) {
            console.error('Error fetching authenticated user:', authError);
            return;
          }

          const userId = authUser.user.id;

          const { data, error } = await supabase
            .from('users')
            .select('Group')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('Error fetching user group:', error);
          } else {
            setUserGroup(data?.Group);
          }
        } catch (err) {
          console.error('Unexpected error:', err);
        }
      };

      fetchUserGroup();
    }
  }, [Group]);

  const createdAt = moment(item?.created_at).format('MMM D');

  const handleDelete = () => {
    onDelete(item);
  };

  const canShowDeleteButton =
    userGroup === 'ADMIN' || currentUser?.id === item?.user?.id;

  return (
    <TouchableOpacity
      style={[styles.container, highlight && styles.highlightedContainer]}
      onPress={() => {
        /* Handle comment press, if needed */
      }}
    >
      {/* Avatar */}
      <Avatar uri={item?.user?.image} size={hp(5)} />
      <View style={styles.nameTitle}>
        <Text style={styles.text}>{item?.user?.name}</Text>
        <Text style={[styles.text, { color: theme.colors.textDark }]}>
          {item.text}
        </Text>
      </View>
      <Text style={[styles.text, { color: theme.colors.textLight }]}>
        {createdAt}
      </Text>
      {/* Delete button */}
      
      {canShowDeleteButton && (
        <TouchableOpacity onPress={handleDelete}>
          <Icon name="delete" size={20} color={theme.colors.rose} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default CommentItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'white', // Default background color
    borderWidth: 0.5,
    borderColor: theme.colors.darkLight,
    padding: 15,
    borderRadius: theme.radius.xxl,
    borderCurve: 'continuous',
  },
  highlightedContainer: {
    backgroundColor: 'white', // White background for highlighted comments
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for shadow
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 4, // Shadow radius
    elevation: 5, // For Android shadow effect
    borderColor: theme.colors.white, // Optional: Change border color when highlighted
  },
  nameTitle: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  deleteText: {
    color: theme.colors.danger,
  },
});
